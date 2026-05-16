// Route chat — appels à l'IA Groq
const express = require('express');
const router = express.Router();
const { callGroq } = require('../services/groq');
const authMiddleware = require('../middleware/auth');
const quotaMiddleware = require('../middleware/quota');

router.post('/', authMiddleware, quotaMiddleware, async (req, res) => {
  try {
    const { messages, system } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages invalides' });
    }

    const text = await callGroq(messages, system);
    res.json({ content: [{ type: 'text', text }] });

  } catch (error) {
    console.error('Erreur chat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;