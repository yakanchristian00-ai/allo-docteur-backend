const express = require('express');
const cors = require('cors');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const rendezvousRoutes = require('./routes/rendezvous.routes');
const urgencesRoutes = require('./routes/urgences.routes');
const conseilsRoutes = require('./routes/conseils.routes');
const paiementsRoutes = require('./routes/paiements.routes');
const messagesRoutes = require('./routes/messages.routes');
const medecinsRoutes = require('./routes/medecins.routes');
const statsRoutes = require('./routes/stats.routes');
const usersRoutes = require('./routes/users.routes');
const tarifsRoutes = require('./routes/tarifs.routes');
const moderationRoutes = require('./routes/moderation.routes');
const parametresRoutes = require('./routes/parametres.routes');
const abonnementsRoutes = require('./routes/abonnements.routes');
const profilMedecinRoutes = require('./routes/profil-medecin.routes');
const disponibilitesRoutes = require('./routes/disponibilites.routes');
const profilRoutes = require('./routes/profil.routes');
const fichiersRoutes = require('./routes/fichiers.routes');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requêtes max par IP
  message: { message: 'Trop de requêtes, réessayez plus tard.' },
});
app.use('/api/', limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 tentatives de connexion max
  message: { message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.' },
});
app.use('/api/auth/login', loginLimiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/rendez-vous', rendezvousRoutes);
app.use('/api/urgences', urgencesRoutes);
app.use('/api/conseils', conseilsRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/medecins', medecinsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tarifs', tarifsRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/abonnements', abonnementsRoutes);
app.use('/api/profil-medecin', profilMedecinRoutes);
app.use('/api/disponibilites', disponibilitesRoutes);
app.use('/api/profil', profilRoutes);
app.use('/api/fichiers', fichiersRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API Allo Docteur en ligne' });
});

const PORT = process.env.PORT || 2000;
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur interne est survenue' });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});