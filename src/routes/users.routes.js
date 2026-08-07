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
            'SELECT id, nom, prenom, email, telephone, role, actif, date_creation FROM users ORDER BY date_creation DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { actif } = req.body;
    try {
        const result = await pool.query('UPDATE users SET actif = $1 WHERE id = $2 RETURNING *', [actif, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }
        res.json({ message: 'Statut mis à jour', user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;