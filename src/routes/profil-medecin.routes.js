const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('node:path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `photo-${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 Mo max

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
}

// Récupère mon propre profil médecin complet
router.get('/moi', authMiddleware, async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ message: 'Accès réservé aux médecins' });
  }
  try {
    const result = await pool.query(
      `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.photo_url,
              m.id AS medecin_id, m.specialite, m.licence, m.bio, m.hopital, m.statut
       FROM users u JOIN medecins m ON m.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Profil introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Le médecin modifie DIRECTEMENT ses champs libres (photo, téléphone, bio)
router.put('/moi', authMiddleware, async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ message: 'Accès réservé aux médecins' });
  }
  const { telephone, photo_url, bio } = req.body;
  try {
    await pool.query('UPDATE users SET telephone = $1, photo_url = $2 WHERE id = $3', [telephone, photo_url, req.user.id]);
    await pool.query('UPDATE medecins SET bio = $1 WHERE user_id = $2', [bio, req.user.id]);
    res.json({ message: 'Profil mis à jour' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Le médecin CRÉE une demande de modification pour un champ sensible
router.post('/demande', authMiddleware, async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ message: 'Accès réservé aux médecins' });
  }
  const { champ, valeur_actuelle, valeur_demandee } = req.body;
  const champsAutorises = ['nom_complet', 'specialite', 'hopital'];
  if (!champsAutorises.includes(champ)) {
    return res.status(400).json({ message: 'Champ non autorisé pour demande' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO demandes_modification (medecin_user_id, champ, valeur_actuelle, valeur_demandee)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, champ, valeur_actuelle, valeur_demandee]
    );
    res.status(201).json({ message: 'Demande envoyée à l\'administrateur', demande: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mes demandes en cours (médecin)
router.get('/mes-demandes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM demandes_modification WHERE medecin_user_id = $1 ORDER BY date_demande DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ADMIN : liste de toutes les demandes en attente
router.get('/demandes', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.nom, u.prenom, u.email
       FROM demandes_modification d
       JOIN users u ON u.id = d.medecin_user_id
       WHERE d.statut = 'en_attente'
       ORDER BY d.date_demande DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ADMIN : traite une demande (approuver/refuser)
router.patch('/demandes/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // 'approuvee' ou 'refusee'

  try {
    const demande = await pool.query('SELECT * FROM demandes_modification WHERE id = $1', [id]);
    if (demande.rows.length === 0) return res.status(404).json({ message: 'Demande introuvable' });

    const d = demande.rows[0];

    if (decision === 'approuvee') {
      if (d.champ === 'nom_complet') {
        const [prenom, ...reste] = d.valeur_demandee.split(' ');
        await pool.query('UPDATE users SET prenom = $1, nom = $2 WHERE id = $3', [prenom, reste.join(' '), d.medecin_user_id]);
      } else if (d.champ === 'specialite') {
        await pool.query('UPDATE medecins SET specialite = $1 WHERE user_id = $2', [d.valeur_demandee, d.medecin_user_id]);
      } else if (d.champ === 'hopital') {
        await pool.query('UPDATE medecins SET hopital = $1 WHERE user_id = $2', [d.valeur_demandee, d.medecin_user_id]);
      }
    }

    await pool.query(
      'UPDATE demandes_modification SET statut = $1, date_traitement = NOW() WHERE id = $2',
      [decision, id]
    );

    res.json({ message: `Demande ${decision}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ADMIN : modifie directement TOUT (y compris champs sensibles + statut + licence)
router.put('/:userId/admin', authMiddleware, adminOnly, async (req, res) => {
  const { userId } = req.params;
  const { nom, prenom, telephone, photo_url, specialite, licence, bio, hopital, statut } = req.body;

  try {
    // Vérifie si la licence change, pour tracer l'historique
    const medecinActuel = await pool.query('SELECT licence FROM medecins WHERE user_id = $1', [userId]);
    const ancienneLicence = medecinActuel.rows[0]?.licence;

    if (ancienneLicence !== licence) {
      await pool.query(
        `INSERT INTO historique_licences (medecin_user_id, ancienne_licence, nouvelle_licence, modifie_par_id)
         VALUES ($1, $2, $3, $4)`,
        [userId, ancienneLicence, licence, req.user.id]
      );
    }

    await pool.query(
      'UPDATE users SET nom = $1, prenom = $2, telephone = $3, photo_url = $4 WHERE id = $5',
      [nom, prenom, telephone, photo_url, userId]
    );
    await pool.query(
      'UPDATE medecins SET specialite = $1, licence = $2, bio = $3, hopital = $4, statut = $5 WHERE user_id = $6',
      [specialite, licence, bio, hopital, statut, userId]
    );
    res.json({ message: 'Profil médecin mis à jour par l\'administrateur' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Upload de la photo de profil (médecin)
router.post('/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ message: 'Accès réservé aux médecins' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune image reçue' });
  }

  try {
    const url = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET photo_url = $1 WHERE id = $2', [url, req.user.id]);
    res.json({ message: 'Photo mise à jour', photo_url: url });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ADMIN : historique des changements de licence d'un médecin
router.get('/:userId/historique-licence', authMiddleware, adminOnly, async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT h.*, u.nom AS modifie_par_nom, u.prenom AS modifie_par_prenom
       FROM historique_licences h
       LEFT JOIN users u ON h.modifie_par_id = u.id
       WHERE h.medecin_user_id = $1
       ORDER BY h.date_modification DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ADMIN : historique complet de TOUTES les modifications de TOUS les médecins
router.get('/audit/historique-complet', authMiddleware, adminOnly, async (req, res) => {
  try {
    const licences = await pool.query(`
      SELECT h.id, 'licence' AS type, h.medecin_user_id, u.nom, u.prenom,
             h.ancienne_licence AS ancienne_valeur, h.nouvelle_licence AS nouvelle_valeur,
             mu.nom AS modifie_par_nom, mu.prenom AS modifie_par_prenom,
             h.date_modification AS date_action
      FROM historique_licences h
      JOIN users u ON h.medecin_user_id = u.id
      LEFT JOIN users mu ON h.modifie_par_id = mu.id
    `);

    const demandes = await pool.query(`
      SELECT d.id, 'demande_' || d.statut AS type, d.medecin_user_id, u.nom, u.prenom,
             d.champ AS ancienne_valeur, d.valeur_demandee AS nouvelle_valeur,
             NULL AS modifie_par_nom, NULL AS modifie_par_prenom,
             COALESCE(d.date_traitement, d.date_demande) AS date_action
      FROM demandes_modification d
      JOIN users u ON d.medecin_user_id = u.id
      WHERE d.statut != 'en_attente'
    `);

    const tout = [...licences.rows, ...demandes.rows].sort(
      (a, b) => new Date(b.date_action) - new Date(a.date_action)
    );

    res.json(tout);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
