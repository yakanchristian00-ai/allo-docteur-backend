const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assurer l'existence du dossier de stockage d'uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer pour le stockage des pièces jointes (images & documents)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite : 10 Mo
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Format de fichier non supporté. Formats acceptés : Images (JPG, PNG, GIF, WEBP) et Documents (PDF, DOC, DOCX, TXT).'));
    }
});

// 1. UPLOAD de pièce jointe (Image ou Document)
router.post('/upload', authMiddleware, upload.single('fichier'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        const isImage = req.file.mimetype.startsWith('image/');
        const fileUrl = `/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'Fichier téléchargé avec succès',
            fichier: {
                url: fileUrl,
                nom_original: req.file.originalname,
                taille: req.file.size,
                mimetype: req.file.mimetype,
                type: isImage ? 'image' : 'document'
            }
        });
    } catch (err) {
        console.error('Erreur upload:', err);
        res.status(500).json({ message: err.message || 'Erreur lors du téléchargement du fichier' });
    }
});

// 2. ENVOYER un message (texte et/ou pièce jointe)
router.post('/', authMiddleware, async (req, res) => {
  const { destinataire_id, contenu, rendez_vous_id, piece_jointe_url, piece_jointe_nom } = req.body;
  const expediteur_id = req.user.id;

  try {
    const newMessage = await pool.query(
      `INSERT INTO messages (expediteur_id, destinataire_id, rendez_vous_id, contenu, lu, piece_jointe_url, piece_jointe_nom) 
       VALUES ($1, $2, $3, $4, false, $5, $6) 
       RETURNING *`,
      [expediteur_id, destinataire_id, rendez_vous_id || null, contenu || '', piece_jointe_url || null, piece_jointe_nom || null]
    );

    res.status(201).json({
      message: 'Message envoyé',
      data: newMessage.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// 3. LISTE des conversations avec compteur de non-lus
router.get('/conversations', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (contact_id) 
         contact_id, 
         u.nom AS contact_nom, 
         u.prenom AS contact_prenom,
         u.role AS contact_role,
         med.specialite AS contact_specialite,
         m.contenu AS dernier_message,
         m.date_envoi AS date_dernier_message,
         m.lu
       FROM (
         SELECT 
           CASE WHEN expediteur_id = $1 THEN destinataire_id ELSE expediteur_id END AS contact_id,
           contenu, date_envoi, lu, expediteur_id
         FROM messages
         WHERE expediteur_id = $1 OR destinataire_id = $1
       ) m
       JOIN users u ON u.id = m.contact_id
       LEFT JOIN medecins med ON med.user_id = u.id
       ORDER BY contact_id, date_envoi DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 4. MESSAGES d'une conversation spécifique + Marquage automatique comme lus
router.get('/conversation/:contactId', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { contactId } = req.params;

    try {
        // Marquer les messages reçus de ce contact comme lus
        await pool.query(
            `UPDATE messages SET lu = true 
             WHERE expediteur_id = $1 AND destinataire_id = $2 AND lu = false`,
            [contactId, userId]
        );

        const result = await pool.query(
            `SELECT * FROM messages
             WHERE (expediteur_id = $1 AND destinataire_id = $2)
                OR (expediteur_id = $2 AND destinataire_id = $1)
             ORDER BY date_envoi ASC`,
            [userId, contactId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Erreur messages conversation:', err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// 5. COMPTEUR GLOBAL de messages non lus (Notifications)
router.get('/non-lus/count', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT COUNT(*)::int AS count 
             FROM messages 
             WHERE destinataire_id = $1 AND lu = false`,
            [userId]
        );

        res.json({ unreadCount: result.rows[0]?.count || 0 });
    } catch (err) {
        console.error('Erreur compteur non lus:', err.message);
        res.json({ unreadCount: 0 });
    }
});

// 6. MARQUER un message comme lu
router.patch('/:id/lu', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE messages SET lu = true 
             WHERE id = $1 AND destinataire_id = $2 
             RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Message introuvable ou non autorisé' });
        }

        res.json({ message: 'Message marqué comme lu', data: result.rows[0] });
    } catch (err) {
        console.error('Erreur marquer lu:', err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;