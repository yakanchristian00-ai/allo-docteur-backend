const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `photo-${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Modifier ses propres infos (tous rôles confondus)
router.put('/moi', authMiddleware, async (req, res) => {
  const { telephone, adresse } = req.body;
  try {
    await pool.query('UPDATE users SET telephone = $1, adresse = $2 WHERE id = $3', [telephone, adresse, req.user.id]);
    res.json({ message: 'Profil mis à jour' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Upload photo de profil (tous rôles confondus)
router.post('/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune image reçue' });
  }
  try {
    const url = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET photo_url = $1 WHERE id = $2', [url, req.user.id]);
    res.json({ message: 'Photo mise à jour', photo_url: url });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;