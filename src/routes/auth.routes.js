const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// INSCRIPTION
router.post('/register', async (req, res) => {
    const { nom, prenom, email, telephone, mot_de_passe, role } = req.body;

    try {
        // Vérifie que l'email n'existe pas déjà
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hache le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // Insère le nouvel utilisateur
        const newUser = await pool.query(
            `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, nom, prenom, email, role`,
            [nom, prenom, email, telephone, hashedPassword, role]
        );

        res.status(201).json({
            message: 'Inscription réussie',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// CONNEXION
router.post('/login', async (req, res) => {
    const { email, mot_de_passe } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!validPassword) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Génère le token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;