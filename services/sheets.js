// Service Google Sheets — lecture et écriture
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ],
});

const getSheets = async () => {
  return google.sheets({ version: 'v4', auth });
};

// Ajouter une ligne
const appendRow = async (range, values) => {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [values] }
  });
};

// Lire toutes les lignes
const getRows = async (range) => {
  const sheets = await getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
  });
  return response.data.values || [];
};

// Mettre à jour une cellule
const updateCell = async (range, value) => {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] }
  });
};

module.exports = { appendRow, getRows, updateCell };