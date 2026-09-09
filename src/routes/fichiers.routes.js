const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

async function verifierToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
}

router.get('/:filename', verifierToken, async (req, res) => {
  const { filename } = req.params;
  const cheminFichier = path.join(__dirname, '../../uploads', filename);

  if (!fs.existsSync(cheminFichier)) {
    return res.status(404).json({ message: 'Fichier introuvable' });
  }

  try {
    // Cas 1 : photo de profil (n'importe qui connecté peut la voir, comme un avatar public)
    const isPhotoProfil = filename.startsWith('photo-');
    if (isPhotoProfil) {
      return res.sendFile(cheminFichier);
    }

    // Cas 2 : pièce jointe de message → vérifie que l'utilisateur fait partie de la conversation
    const message = await pool.query(
      'SELECT expediteur_id, destinataire_id FROM messages WHERE piece_jointe_url = $1',
      [`/uploads/${filename}`]
    );

    if (message.rows.length === 0) {
      return res.status(404).json({ message: 'Fichier introuvable' });
    }

    const { expediteur_id, destinataire_id } = message.rows[0];
    const estAutorise = req.user.id === expediteur_id || req.user.id === destinataire_id || req.user.role === 'admin';

    if (!estAutorise) {
      return res.status(403).json({ message: 'Accès refusé à ce fichier' });
    }

    res.sendFile(cheminFichier);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;