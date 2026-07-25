const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé, token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contient { id, role }
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token invalide' });
    }
}

module.exports = authMiddleware;