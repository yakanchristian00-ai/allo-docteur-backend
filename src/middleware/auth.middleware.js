const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifie que le compte est toujours actif à CHAQUE requête
    const result = await pool.query('SELECT actif FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0 || result.rows[0].actif === false) {
      return res.status(403).json({ message: 'Compte suspendu ou introuvable' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
}

module.exports = authMiddleware;