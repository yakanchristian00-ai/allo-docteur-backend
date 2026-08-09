const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
const app = express();

app.use(cors());
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
app.get('/', (req, res) => {
    res.json({ message: 'API Allo Docteur en ligne' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});