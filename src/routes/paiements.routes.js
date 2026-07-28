const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

const METHODES_VALIDES = [
    'orange_money',
    'mtn_momo',
    'moov_money',
    'wave',
    'carte_bancaire',
    'especes'
];

// INITIER un paiement (patient connecté)
router.post('/', authMiddleware, async (req, res) => {
    const { rendez_vous_id, montant, methode } = req.body;
    const patient_id = req.user.id;

    if (!METHODES_VALIDES.includes(methode)) {
        return res.status(400).json({
            message: 'Méthode de paiement invalide',
            methodes_acceptees: METHODES_VALIDES
        });
    }

    try {
        const rdv = await pool.query(
            'SELECT id FROM rendez_vous WHERE id = $1 AND patient_id = $2',
            [rendez_vous_id, patient_id]
        );

        if (rdv.rows.length === 0) {
            return res.status(404).json({ message: 'Rendez-vous introuvable ou non autorisé' });
        }

        const newPaiement = await pool.query(
            `INSERT INTO paiements (rendez_vous_id, patient_id, montant, methode, statut) 
       VALUES ($1, $2, $3, $4, 'en_attente') 
       RETURNING *`,
            [rendez_vous_id, patient_id, montant, methode]
        );

        res.status(201).json({
            message: 'Paiement initié',
            paiement: newPaiement.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DÉTAIL d'un paiement précis
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM paiements WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Paiement introuvable' });
        }

        const paiement = result.rows[0];

        if (paiement.patient_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        res.json(paiement);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// HISTORIQUE des paiements d'un patient (le sien uniquement)
router.get('/patient/historique', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, rv.date_rdv, rv.motif
       FROM paiements p
       LEFT JOIN rendez_vous rv ON p.rendez_vous_id = rv.id
       WHERE p.patient_id = $1
       ORDER BY p.date_paiement DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// METTRE À JOUR le statut d'un paiement (webhook / confirmation)
router.patch('/:id/statut', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    if (!['reussi', 'echoue', 'en_attente'].includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide' });
    }

    try {
        const result = await pool.query(
            `UPDATE paiements SET statut = $1 WHERE id = $2 RETURNING *`,
            [statut, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Paiement introuvable' });
        }

        res.json({ message: 'Statut de paiement mis à jour', paiement: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// LISTE des méthodes de paiement disponibles (utile pour le frontend)
router.get('/methodes/disponibles', authMiddleware, (req, res) => {
    res.json({ methodes: METHODES_VALIDES });
});

module.exports = router;