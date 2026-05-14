require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

// ── GOOGLE SHEETS AUTH ──
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// ── CHAT ──
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;
    const fullMessages = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: fullMessages
      })
    });

    const data = await response.json();
    res.json({
      content: [{
        type: 'text',
        text: data.choices?.[0]?.message?.content || 'Pas de réponse.'
      }]
    });

  } catch (error) {
    console.error('Erreur chat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── ENREGISTRER UNE NOTE ──
app.post('/api/rating', async (req, res) => {
  try {
    const { note, commentaire, duree } = req.body;
    const sheets = google.sheets({ version: 'v4', auth });
    const date = new Date().toLocaleString('fr-FR');

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:D',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[date, note, commentaire || '', duree || '']]
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur rating complète:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ error: 'Erreur enregistrement' });
  }
});

// ── VOIR LES STATS (tableau de bord secret) ──
app.get('/api/stats', async (req, res) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:D',
    });

    const rows = response.data.values || [];
    const notes = rows.slice(1).map(r => parseFloat(r[1])).filter(n => !isNaN(n));
    const moyenne = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : 0;

    res.json({
      total_avis: notes.length,
      moyenne: moyenne,
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

app.get('/', (req, res) => {
  res.json({ status: 'StudyOS Backend actif ✅' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});