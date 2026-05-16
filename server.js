// ═══════════════════════════════════════
//  StudyOS Backend — Point d'entrée
//  Architecture modulaire long terme
// ═══════════════════════════════════════
require('dotenv').config();
const express = require('express');

// ── Middlewares ──
const corsMiddleware = require('./middleware/cors');
const logger = require('./middleware/logger');

// ── Routes ──
const chatRoutes = require('./routes/chat');
const ratingRoutes = require('./routes/rating');
const statsRoutes = require('./routes/stats');
const filesRoutes = require('./routes/files');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

const app = express();

// ── Application des middlewares globaux ──
app.use(corsMiddleware);
app.use(express.json());
app.use(logger);

// ── Application des routes ──
app.use('/api/chat', chatRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// ── Route de santé — vérifie que le serveur tourne ──
app.get('/', (req, res) => {
  res.json({
    status: 'StudyOS Backend actif ✅',
    version: '2.0.0',
    architecture: 'modulaire',
    routes: [
      'POST /api/chat',
      'POST /api/rating',
      'GET  /api/rating/stats',
      'GET  /api/stats/:userId',
      'POST /api/stats/update',
      'POST /api/files/upload',
      'GET  /api/files/list',
      'GET  /api/files/download/:fileId',
      'DELETE /api/files/:fileId',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/payment/initiate',
    ]
  });
});

// ── Gestion des erreurs globales ──
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err.message);
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

// ── Démarrage ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════╗
  ║   StudyOS Backend v2.0.0     ║
  ║   Port : ${PORT}                 ║
  ║   Architecture : modulaire   ║
  ╚═══════════════════════════════╝
  `);
});