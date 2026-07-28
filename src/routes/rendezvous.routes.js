const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// CRÉER un rendez-vous (patient connecté)
router.post('/', authMiddleware, async (req, res) => {
    const { medecin_id, date_rdv, motif } = req.body;
    const patient_id = req.user.id;

    try {
        const newRdv = await pool.query(
            `INSERT INTO rendez_vous (patient_id, medecin_id, date_rdv, motif, statut) 
       VALUES ($1, $2, $3, $4, 'en_attente') 
       RETURNING *`,
            [patient_id, medecin_id, date_rdv, motif]
        );

        res.status(201).json({
            message: 'Rendez-vous créé avec succès',
            rendez_vous: newRdv.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// CONSULTER les rendez-vous d'un patient (le sien uniquement)
router.get('/mes-rendez-vous', authMiddleware, async (req, res) => {
    const patient_id = req.user.id;

    try {
        const result = await pool.query(
            `SELECT rv.*, u.nom AS medecin_nom, u.prenom AS medecin_prenom, m.specialite
       FROM rendez_vous rv
       JOIN medecins m ON rv.medecin_id = m.id
       JOIN users u ON m.user_id = u.id
       WHERE rv.patient_id = $1
       ORDER BY rv.date_rdv DESC`,
            [patient_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// CONSULTER les rendez-vous d'un médecin (le sien uniquement)
router.get('/medecin/mes-rendez-vous', authMiddleware, async (req, res) => {
    if (req.user.role !== 'medecin') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
    }

    try {
        // Récupère l'id médecin lié à cet utilisateur
        const medecinResult = await pool.query(
            'SELECT id FROM medecins WHERE user_id = $1',
            [req.user.id]
        );

        if (medecinResult.rows.length === 0) {
            return res.status(404).json({ message: 'Profil médecin introuvable' });
        }

        const medecin_id = medecinResult.rows[0].id;

        const result = await pool.query(
            `SELECT rv.*, u.nom AS patient_nom, u.prenom AS patient_prenom
       FROM rendez_vous rv
       JOIN users u ON rv.patient_id = u.id
       WHERE rv.medecin_id = $1
       ORDER BY rv.date_rdv ASC`,
            [medecin_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DÉTAIL d'un rendez-vous précis
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT rv.*, u.nom AS patient_nom, u.prenom AS patient_prenom
       FROM rendez_vous rv
       JOIN users u ON rv.patient_id = u.id
       WHERE rv.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rendez-vous introuvable' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// ANNULER un rendez-vous
router.patch('/:id/annuler', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE rendez_vous SET statut = 'annule' 
       WHERE id = $1 AND patient_id = $2 
       RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rendez-vous introuvable ou non autorisé' });
        }

        res.json({ message: 'Rendez-vous annulé', rendez_vous: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// CONFIRMER un rendez-vous (médecin)
router.patch('/:id/confirmer', authMiddleware, async (req, res) => {
    if (req.user.role !== 'medecin') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE rendez_vous SET statut = 'confirme' WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rendez-vous introuvable' });
        }

        res.json({ message: 'Rendez-vous confirmé', rendez_vous: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;