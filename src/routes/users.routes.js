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
router.post('/creer-medecin', authMiddleware, adminOnly, async (req, res) => {
    const { nom, prenom, email, telephone, mot_de_passe, specialite, licence } = req.body;
    const bcrypt = require('bcrypt');

    try {
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        const newUser = await pool.query(
            `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) 
       VALUES ($1, $2, $3, $4, $5, 'medecin') 
       RETURNING id, nom, prenom, email`,
            [nom, prenom, email, telephone, hashedPassword]
        );

        const userId = newUser.rows[0].id;

        const newMedecin = await pool.query(
            `INSERT INTO medecins (user_id, specialite, licence, valide) 
       VALUES ($1, $2, $3, true) 
       RETURNING *`,
            [userId, specialite, licence]
        );

        res.status(201).json({
            message: 'Médecin créé avec succès',
            user: newUser.rows[0],
            medecin: newMedecin.rows[0],
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;