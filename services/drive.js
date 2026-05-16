// Service Google Drive — upload, liste, download, suppression
const { google } = require('googleapis');
const { Readable } = require('stream');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ],
});

const getDrive = async () => {
  return google.drive({ version: 'v3', auth });
};

// Créer le dossier StudyOS si inexistant
const getOrCreateFolder = async () => {
  const drive = await getDrive();

  // Chercher si le dossier existe déjà
  const res = await drive.files.list({
    q: `name='StudyOS_Files' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  // Créer le dossier
  const folder = await drive.files.create({
    requestBody: {
      name: 'StudyOS_Files',
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return folder.data.id;
};

// Uploader un fichier
const uploadFile = async (buffer, filename, mimetype) => {
  const drive = await getDrive();
  const folderId = await getOrCreateFolder();

  const stream = Readable.from(buffer);

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: mimetype,
      body: stream,
    },
    fields: 'id, name, size, createdTime',
  });

  // Rendre le fichier accessible via lien
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return response.data;
};

// Lister tous les fichiers
const listFiles = async () => {
  const drive = await getDrive();
  const folderId = await getOrCreateFolder();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, size, createdTime, mimeType)',
    orderBy: 'createdTime desc',
  });

  return response.data.files || [];
};

// Télécharger un fichier
const downloadFile = async (fileId) => {
  const drive = await getDrive();
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return response.data;
};

// Supprimer un fichier
const deleteFile = async (fileId) => {
  const drive = await getDrive();
  await drive.files.delete({ fileId });
};

// Infos d'un fichier
const getFileInfo = async (fileId) => {
  const drive = await getDrive();
  const response = await drive.files.get({
    fileId,
    fields: 'id, name, size, createdTime, mimeType',
  });
  return response.data;
};

module.exports = { uploadFile, listFiles, downloadFile, deleteFile, getFileInfo };