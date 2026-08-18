const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// DÉCLARER une urgence (patient connecté)
router.post('/', authMiddleware, async (req, res) => {
    const { symptomes, gravite, position } = req.body;
    const patient_id = req.user.id;

    try {
        const newUrgence = await pool.query(
            `INSERT INTO urgences (patient_id, symptomes, gravite, position, statut) 
       VALUES ($1, $2, $3, $4, 'en_attente') 
       RETURNING *`,
            [patient_id, symptomes, gravite, position]
        );

        res.status(201).json({
            message: 'Urgence déclarée avec succès',
            urgence: newUrgence.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// LISTE des urgences en attente (médecin uniquement)
router.get('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'medecin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé au personnel médical' });
    }

    try {
        const result = await pool.query(
            `SELECT u.*, us.nom AS patient_nom, us.prenom AS patient_prenom, us.telephone
       FROM urgences u
       JOIN users us ON u.patient_id = us.id
       WHERE u.statut = 'en_attente'
       ORDER BY 
         CASE u.gravite 
           WHEN 'critique' THEN 1 
           WHEN 'serieuse' THEN 2 
           WHEN 'moderee' THEN 3 
         END,
         u.date_creation ASC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// MES urgences (patient - historique)
router.get('/mes-urgences', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.*, med_user.nom AS medecin_nom, med_user.prenom AS medecin_prenom, m.specialite
       FROM urgences u
       LEFT JOIN medecins m ON u.medecin_id = m.id
       LEFT JOIN users med_user ON m.user_id = med_user.id
       WHERE u.patient_id = $1 ORDER BY u.date_creation DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// PRENDRE EN CHARGE une urgence (médecin)
router.patch('/:id/prise-en-charge', authMiddleware, async (req, res) => {
    if (req.user.role !== 'medecin') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
    }
    const { id } = req.params;
    try {
        const medecinResult = await pool.query('SELECT id FROM medecins WHERE user_id = $1', [req.user.id]);
        if (medecinResult.rows.length === 0) {
            return res.status(404).json({ message: 'Profil médecin introuvable' });
        }
        const medecinId = medecinResult.rows[0].id;
        const result = await pool.query(
            `UPDATE urgences SET statut = 'prise_en_charge', medecin_id = $1 WHERE id = $2 RETURNING *`,
            [medecinId, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Urgence introuvable' });
        }
        res.json({ message: 'Urgence prise en charge', urgence: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// CLÔTURER une urgence (médecin)
router.patch('/:id/cloturer', authMiddleware, async (req, res) => {
    if (req.user.role !== 'medecin') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE urgences SET statut = 'cloturee' WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Urgence introuvable' });
        }
        res.json({ message: 'Urgence clôturée', urgence: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
module.exports = router;