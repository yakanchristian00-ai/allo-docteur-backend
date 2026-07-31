const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// LISTE des médecins (avec filtre spécialité optionnel)
router.get('/', authMiddleware, async (req, res) => {
    const { specialite } = req.query;

    try {
        let query = `SELECT m.id, m.specialite, m.valide, u.nom, u.prenom
                 FROM medecins m
                 JOIN users u ON m.user_id = u.id
                 WHERE m.valide = true`;
        const params = [];

        if (specialite) {
            query += ` AND m.specialite = $1`;
            params.push(specialite);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;