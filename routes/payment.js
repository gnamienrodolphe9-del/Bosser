// Route paiement — vide pour l'instant
// Sera complétée quand on ajoutera Wave/CinetPay
const express = require('express');
const router = express.Router();

// Initier un paiement
router.post('/initiate', async (req, res) => {
  res.json({ message: 'Bientôt disponible' });
});

// Vérifier un paiement
router.post('/verify', async (req, res) => {
  res.json({ message: 'Bientôt disponible' });
});

// Webhook paiement
router.post('/webhook', async (req, res) => {
  res.json({ message: 'Bientôt disponible' });
});

module.exports = router;