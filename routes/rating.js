// Route notation — enregistre les avis dans Google Sheets
const express = require('express');
const router = express.Router();
const { appendRow, getRows } = require('../services/sheets');

// Enregistrer un avis
router.post('/', async (req, res) => {
  try {
    const { note, commentaire, duree } = req.body;
    if (!note || !commentaire) {
      return res.status(400).json({ error: 'Note et commentaire obligatoires' });
    }

    const date = new Date().toLocaleString('fr-FR');
    await appendRow('Sheet1!A:D', [date, note, commentaire, duree || '']);
    res.json({ success: true });

  } catch (error) {
    console.error('Erreur rating:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ error: 'Erreur enregistrement' });
  }
});

// Voir les stats des avis
router.get('/stats', async (req, res) => {
  try {
    const rows = await getRows('Sheet1!A:D');
    const notes = rows.slice(1).map(r => parseFloat(r[1])).filter(n => !isNaN(n));
    const moyenne = notes.length
      ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1)
      : 0;

    res.json({
      total_avis: notes.length,
      moyenne,
      repartition: {
        '5 étoiles': notes.filter(n => n === 5).length,
        '4 étoiles': notes.filter(n => n === 4).length,
        '3 étoiles': notes.filter(n => n === 3).length,
        '2 étoiles': notes.filter(n => n === 2).length,
        '1 étoile': notes.filter(n => n === 1).length,
      },
      derniers_avis: rows.slice(-5).reverse()
    });

  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur stats' });
  }
});

module.exports = router;