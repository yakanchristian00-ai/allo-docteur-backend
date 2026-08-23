const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// LISTE des conseils
// - Patient : voit les génériques (patient_id NULL) + ceux qui lui sont personnellement assignés
// - Médecin/Admin : voit tout, pour pouvoir gérer
router.get('/', authMiddleware, async (req, res) => {
  const { categorie } = req.query;

  try {
    let query, params;

    if (req.user.role === 'patient') {
      query = `SELECT c.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
               FROM conseils_dietetiques c
               JOIN users u ON c.auteur_id = u.id
               WHERE (c.patient_id IS NULL OR c.patient_id = $1)`;
      params = [req.user.id];
      if (categorie) {
        query += ` AND c.categorie = $2`;
        params.push(categorie);
      }
    } else {
      query = `SELECT c.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom,
                       p.nom AS patient_nom, p.prenom AS patient_prenom
               FROM conseils_dietetiques c
               JOIN users u ON c.auteur_id = u.id
               LEFT JOIN users p ON c.patient_id = p.id
               WHERE 1=1`;
      params = [];
      if (categorie) {
        query += ` AND c.categorie = $1`;
        params.push(categorie);
      }
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
      `SELECT c.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom,
              p.nom AS patient_nom, p.prenom AS patient_prenom
       FROM conseils_dietetiques c
       JOIN users u ON c.auteur_id = u.id
       LEFT JOIN users p ON c.patient_id = p.id
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

// CRÉER un conseil (médecin ou admin), avec patient_id optionnel
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'medecin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé au personnel médical' });
  }

  const { titre, contenu, categorie, patient_id } = req.body;
  const auteur_id = req.user.id;

  try {
    const newConseil = await pool.query(
      `INSERT INTO conseils_dietetiques (auteur_id, titre, contenu, categorie, patient_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [auteur_id, titre, contenu, categorie, patient_id || null]
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

// MODIFIER un conseil (auteur ou admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { titre, contenu, categorie, patient_id } = req.body;

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
      `UPDATE conseils_dietetiques SET titre = $1, contenu = $2, categorie = $3, patient_id = $4 
       WHERE id = $5 RETURNING *`,
      [titre, contenu, categorie, patient_id || null, id]
    );

    res.json({ message: 'Conseil mis à jour', conseil: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// SUPPRIMER un conseil (auteur ou admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const conseil = await pool.query('SELECT auteur_id FROM conseils_dietetiques WHERE id = $1', [id]);
    if (conseil.rows.length === 0) {
      return res.status(404).json({ message: 'Conseil introuvable' });
    }

    const estAuteur = conseil.rows[0].auteur_id === req.user.id;
    const estAdmin = req.user.role === 'admin';

    if (!estAuteur && !estAdmin) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce conseil' });
    }

    await pool.query('DELETE FROM conseils_dietetiques WHERE id = $1', [id]);
    res.json({ message: 'Conseil supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;