// Route authentification — vide pour l'instant
// Sera complétée quand on ajoutera les comptes utilisateurs
const express = require('express');
const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  res.json({ message: 'Bientôt disponible' });
});

// Connexion
router.post('/login', async (req, res) => {
  res.json({ message: 'Bientôt disponible' });
});

// Déconnexion
router.post('/logout', async (req, res) => {
  res.json({ message: 'Bientôt disponible' });
});

// Vérifier le token
router.get('/me', async (req, res) => {
  res.json({ message: 'Bientôt disponible' });
});

module.exports = router;