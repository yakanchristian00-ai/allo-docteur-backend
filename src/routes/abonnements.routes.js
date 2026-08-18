const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

const PRIX_ABONNEMENT = 2000; // FCFA / mois

// STATUT de mon abonnement (patient connecté)
router.get('/statut', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM abonnements WHERE patient_id = $1 ORDER BY date_creation DESC LIMIT 1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.json({ actif: false, abonnement: null });
        }

        const abo = result.rows[0];
        const actif = abo.statut === 'actif' && new Date(abo.date_fin) > new Date();

        res.json({ actif, abonnement: abo });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// SOUSCRIRE / RENOUVELER un abonnement (simule un paiement)
router.post('/souscrire', authMiddleware, async (req, res) => {
    const { methode } = req.body;
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setMonth(dateFin.getMonth() + 1);

    try {
        const result = await pool.query(
            `INSERT INTO abonnements (patient_id, statut, date_debut, date_fin, montant, methode)
       VALUES ($1, 'actif', $2, $3, $4, $5)
       RETURNING *`,
            [req.user.id, dateDebut, dateFin, PRIX_ABONNEMENT, methode]
        );

        res.status(201).json({ message: 'Abonnement activé', abonnement: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;