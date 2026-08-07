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

router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tarifs ORDER BY service');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
    const { service, description, prix, icone } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO tarifs (service, description, prix, icone) VALUES ($1, $2, $3, $4) RETURNING *`,
            [service, description, prix, icone || '💳']
        );
        res.status(201).json({ message: 'Tarif créé', tarif: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { service, description, prix } = req.body;
    try {
        const result = await pool.query(
            `UPDATE tarifs SET service = $1, description = $2, prix = $3, date_modification = NOW() WHERE id = $4 RETURNING *`,
            [service, description, prix, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarif introuvable' });
        }
        res.json({ message: 'Tarif mis à jour', tarif: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;