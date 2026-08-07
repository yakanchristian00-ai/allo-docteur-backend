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

router.get('/overview', authMiddleware, adminOnly, async (req, res) => {
    try {
        const totalRdv = await pool.query('SELECT COUNT(*) FROM rendez_vous');
        const urgencesTraitees = await pool.query("SELECT COUNT(*) FROM urgences WHERE statut = 'cloturee'");
        const revenus = await pool.query("SELECT COALESCE(SUM(montant),0) as total FROM paiements WHERE statut = 'reussi'");
        const utilisateursActifs = await pool.query('SELECT COUNT(*) FROM users WHERE actif = true');

        const rdvParMois = await pool.query(`
      SELECT TO_CHAR(date_rdv, 'MM') as mois, COUNT(*) as total
      FROM rendez_vous
      GROUP BY mois
      ORDER BY mois
    `);

        const inscriptionsRecentes = await pool.query(`
      SELECT id, nom, prenom, email, role, date_creation, actif
      FROM users
      ORDER BY date_creation DESC
      LIMIT 6
    `);

        res.json({
            totalRdv: Number(totalRdv.rows[0].count),
            urgencesTraitees: Number(urgencesTraitees.rows[0].count),
            revenus: Number(revenus.rows[0].total),
            utilisateursActifs: Number(utilisateursActifs.rows[0].count),
            rdvParMois: rdvParMois.rows,
            inscriptionsRecentes: inscriptionsRecentes.rows,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;