const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// ENVOYER un message
router.post('/', authMiddleware, async (req, res) => {
    const { destinataire_id, contenu, rendez_vous_id } = req.body;
    const expediteur_id = req.user.id;

    try {
        const newMessage = await pool.query(
            `INSERT INTO messages (expediteur_id, destinataire_id, rendez_vous_id, contenu, lu) 
       VALUES ($1, $2, $3, $4, false) 
       RETURNING *`,
            [expediteur_id, destinataire_id, rendez_vous_id || null, contenu]
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

// LISTE des conversations (résumé : un contact par ligne, avec dernier message)
router.get('/conversations', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (contact_id) 
         contact_id, 
         u.nom AS contact_nom, 
         u.prenom AS contact_prenom,
         u.role AS contact_role,
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
       ORDER BY contact_id, date_envoi DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// MESSAGES d'une conversation avec un contact précis
router.get('/conversation/:contactId', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { contactId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM messages
       WHERE (expediteur_id = $1 AND destinataire_id = $2)
          OR (expediteur_id = $2 AND destinataire_id = $1)
       ORDER BY date_envoi ASC`,
            [userId, contactId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// MARQUER un message comme lu
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
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;