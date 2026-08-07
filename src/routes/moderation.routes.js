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

router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM moderation ORDER BY date_signalement DESC'
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.put('/:id/statut', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    try {
        const result = await pool.query(
            'UPDATE moderation SET statut = $1 WHERE id = $2 RETURNING *',
            [statut, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Signalement introuvable' });
        }

        res.json({ message: 'Statut mis à jour', signalement: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM moderation WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Signalement introuvable' });
        }

        res.json({ message: 'Signalement supprimé' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;