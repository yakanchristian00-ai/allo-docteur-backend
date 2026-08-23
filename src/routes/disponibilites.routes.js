const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

// Mes disponibilités (médecin connecté)
router.get('/mes-disponibilites', authMiddleware, async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ message: 'Accès réservé aux médecins' });
  }
  try {
    const medecinResult = await pool.query('SELECT id FROM medecins WHERE user_id = $1', [req.user.id]);
    if (medecinResult.rows.length === 0) return res.status(404).json({ message: 'Profil médecin introuvable' });
    const medecinId = medecinResult.rows[0].id;

    const result = await pool.query(
      'SELECT * FROM disponibilites WHERE medecin_id = $1 ORDER BY jour_semaine, heure_debut',
      [medecinId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un créneau
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ message: 'Accès réservé aux médecins' });
  }
  const { jour_semaine, heure_debut, heure_fin } = req.body;

  try {
    const medecinResult = await pool.query('SELECT id FROM medecins WHERE user_id = $1', [req.user.id]);
    if (medecinResult.rows.length === 0) return res.status(404).json({ message: 'Profil médecin introuvable' });
    const medecinId = medecinResult.rows[0].id;

    const result = await pool.query(
      'INSERT INTO disponibilites (medecin_id, jour_semaine, heure_debut, heure_fin) VALUES ($1, $2, $3, $4) RETURNING *',
      [medecinId, jour_semaine, heure_debut, heure_fin]
    );
    res.status(201).json({ message: 'Créneau ajouté', disponibilite: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un créneau
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'medecin') {
    return res.status(403).json({ message: 'Accès réservé aux médecins' });
  }
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM disponibilites WHERE id = $1', [id]);
    res.json({ message: 'Créneau supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Disponibilités d'un médecin précis (pour les patients)
router.get('/medecin/:medecinId', authMiddleware, async (req, res) => {
  const { medecinId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM disponibilites WHERE medecin_id = $1 ORDER BY jour_semaine, heure_debut',
      [medecinId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;