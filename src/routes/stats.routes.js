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

router.get('/revenu-mois', authMiddleware, adminOnly, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT COALESCE(SUM(montant), 0) as total
      FROM paiements
      WHERE statut = 'reussi'
      AND date_paiement >= date_trunc('month', CURRENT_DATE)
    `);
        res.json({ revenuMois: Number(result.rows[0].total) });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/notifications', authMiddleware, adminOnly, async (req, res) => {
    try {
        const inscriptions = await pool.query(`
      SELECT id, nom, prenom, role, date_creation
      FROM users
      WHERE date_creation >= NOW() - INTERVAL '48 hours'
      ORDER BY date_creation DESC
      LIMIT 5
    `);

        const signalements = await pool.query(`
      SELECT id, type, auteur, date_signalement
      FROM moderation
      WHERE statut = 'En attente'
      ORDER BY date_signalement DESC
      LIMIT 5
    `);

        const urgencesCritiques = await pool.query(`
      SELECT u.id, us.nom, us.prenom, u.date_creation
      FROM urgences u
      JOIN users us ON u.patient_id = us.id
      WHERE u.statut = 'en_attente' AND u.gravite = 'critique'
      ORDER BY u.date_creation DESC
      LIMIT 5
    `);

        const notifications = [
            ...inscriptions.rows.map((i) => ({
                id: `insc-${i.id}`,
                type: 'inscription',
                icone: '👤',
                message: `${i.prenom} ${i.nom} s'est inscrit(e) (${i.role})`,
                date: i.date_creation,
            })),
            ...signalements.rows.map((s) => ({
                id: `signal-${s.id}`,
                type: 'signalement',
                icone: '⚠️',
                message: `Signalement (${s.type}) par ${s.auteur} en attente`,
                date: s.date_signalement,
            })),
            ...urgencesCritiques.rows.map((u) => ({
                id: `urg-${u.id}`,
                type: 'urgence',
                icone: '🚨',
                message: `Urgence critique : ${u.prenom} ${u.nom}`,
                date: u.date_creation,
            })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;