const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// LISTE des conseils (accessible à tous les connectés, avec filtre catégorie optionnel)
router.get('/', authMiddleware, async (req, res) => {
    const { categorie } = req.query;

    try {
        let query = `SELECT c.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
                 FROM conseils_dietetiques c
                 JOIN users u ON c.auteur_id = u.id`;
        const params = [];

        if (categorie) {
            query += ` WHERE c.categorie = $1`;
            params.push(categorie);
        }

        query += ` ORDER BY c.date_creation DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DÉTAIL d'un conseil précis
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT c.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM conseils_dietetiques c
       JOIN users u ON c.auteur_id = u.id
       WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Conseil introuvable' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// CRÉER un conseil (médecin ou admin uniquement)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'medecin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé au personnel médical' });
    }

    const { titre, contenu, categorie } = req.body;
    const auteur_id = req.user.id;

    try {
        const newConseil = await pool.query(
            `INSERT INTO conseils_dietetiques (auteur_id, titre, contenu, categorie) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [auteur_id, titre, contenu, categorie]
        );

        res.status(201).json({
            message: 'Conseil créé avec succès',
            conseil: newConseil.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// MODIFIER un conseil (auteur uniquement, ou admin)
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { titre, contenu, categorie } = req.body;

    try {
        const conseil = await pool.query('SELECT auteur_id FROM conseils_dietetiques WHERE id = $1', [id]);

        if (conseil.rows.length === 0) {
            return res.status(404).json({ message: 'Conseil introuvable' });
        }

        const estAuteur = conseil.rows[0].auteur_id === req.user.id;
        const estAdmin = req.user.role === 'admin';

        if (!estAuteur && !estAdmin) {
            return res.status(403).json({ message: 'Non autorisé à modifier ce conseil' });
        }

        const result = await pool.query(
            `UPDATE conseils_dietetiques SET titre = $1, contenu = $2, categorie = $3 
       WHERE id = $4 RETURNING *`,
            [titre, contenu, categorie, id]
        );

        res.json({ message: 'Conseil mis à jour', conseil: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// SUPPRIMER un conseil (admin uniquement)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM conseils_dietetiques WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Conseil introuvable' });
        }

        res.json({ message: 'Conseil supprimé' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;