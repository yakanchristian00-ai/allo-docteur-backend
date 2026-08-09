const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }

    next();
}
router.get('/public', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
        maintenance,
        inscriptions_medecins,
        urgences_actives,
        notifications_email
       FROM parametres
       ORDER BY id
       LIMIT 1`
        );

        if (result.rows.length === 0) {
            return res.json({
                maintenance: false,
                inscriptions_medecins: true,
                urgences_actives: true,
                notifications_email: true,
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const parametresResult = await pool.query(
            'SELECT * FROM parametres ORDER BY id LIMIT 1'
        );

        if (parametresResult.rows.length === 0) {
            return res.status(404).json({ message: 'Paramètres introuvables' });
        }

        const adminResult = await pool.query(
            "SELECT email FROM users WHERE role = 'admin' LIMIT 1"
        );

        res.json({
            ...parametresResult.rows[0],
            email_admin: adminResult.rows[0]?.email || '',
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.put('/', authMiddleware, adminOnly, async (req, res) => {
    const {
        nom_application,
        telephone_support,
        ville_principale,
        devise,
        maintenance,
        inscriptions_medecins,
        urgences_actives,
        notifications_email,
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE parametres
       SET nom_application = $1,
           telephone_support = $2,
           ville_principale = $3,
           devise = $4,
           maintenance = $5,
           inscriptions_medecins = $6,
           urgences_actives = $7,
           notifications_email = $8,
           date_modification = NOW()
       WHERE id = (SELECT id FROM parametres ORDER BY id LIMIT 1)
       RETURNING *`,
            [
                nom_application,
                telephone_support,
                ville_principale,
                devise,
                maintenance,
                inscriptions_medecins,
                urgences_actives,
                notifications_email,
            ]
        );

        res.json({ message: 'Paramètres mis à jour', parametres: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;