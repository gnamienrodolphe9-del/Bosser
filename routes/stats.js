// Route stats — statistiques d'utilisation dynamiques
const express = require('express');
const router = express.Router();
const { appendRow, getRows, updateCell } = require('../services/sheets');

// Récupérer les stats d'un utilisateur
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await getRows('Sheet2!A:E');
    // Chercher l'utilisateur
    const userRow = rows.find(r => r[0] === userId);
    if (!userRow) {
      return res.json({
        fiches: 0,
        questions: 0,
        score_moyen: 0,
        sessions: 0
      });
    }

    res.json({
      fiches: parseInt(userRow[1]) || 0,
      questions: parseInt(userRow[2]) || 0,
      score_moyen: parseFloat(userRow[3]) || 0,
      sessions: parseInt(userRow[4]) || 0
    });

  } catch (error) {
    console.error('Erreur get stats:', error.message);
    // res.status(500).json({ error: 'Erreur stats' });
    res.json({
      fiches: 0,
      questions: 0,
      score_moyen: 0,
      sessions: 0
    });
  }
});

// Mettre à jour les stats
router.post('/update', async (req, res) => {
  try {
    const { userId, action, value } = req.body;
    const rows = await getRows('Sheet2!A:E');

    // Chercher la ligne de l'utilisateur
    const rowIndex = rows.findIndex(r => r[0] === userId);

    if (rowIndex === -1) {
      // Nouvel utilisateur — créer une ligne
      await appendRow('Sheet2!A:E', [
        userId,
        action === 'fiche' ? 1 : 0,
        action === 'question' ? 1 : 0,
        action === 'score' ? value : 0,
        1
      ]);
    } else {
      // Utilisateur existant — mettre à jour
      const row = rows[rowIndex];
      const sheetRow = rowIndex + 1;

      if (action === 'fiche') {
        await updateCell(`Stats!B${sheetRow}`, (parseInt(row[1]) || 0) + 1);
      } else if (action === 'question') {
        await updateCell(`Stats!C${sheetRow}`, (parseInt(row[2]) || 0) + 1);
      } else if (action === 'score') {
        const oldScore = parseFloat(row[3]) || 0;
        const newScore = oldScore === 0 ? value : ((oldScore + value) / 2).toFixed(1);
        await updateCell(`Stats!D${sheetRow}`, newScore);
      } else if (action === 'session') {
        await updateCell(`Stats!E${sheetRow}`, (parseInt(row[4]) || 0) + 1);
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Erreur update stats:', error);
    res.status(500).json({ error: 'Erreur mise à jour stats' });
  }
});

module.exports = router;