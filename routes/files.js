// Route fichiers — upload, liste, download via Google Drive
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile, listFiles, downloadFile, deleteFile, getFileInfo } = require('../services/drive');

// Multer stocke en mémoire (pas sur le disque)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les PDFs sont acceptés'));
    }
  }
});

// Uploader un PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      file: {
        id: result.id,
        name: result.name,
        size: result.size,
        createdTime: result.createdTime
      }
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur upload' });
  }
});

// Lister les PDFs disponibles
router.get('/list', async (req, res) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (error) {
    console.error('Erreur liste:', error);
    res.status(500).json({ error: 'Erreur liste fichiers' });
  }
});

// Télécharger un PDF
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileInfo = await getFileInfo(fileId);
    const buffer = await downloadFile(fileId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Erreur download:', error);
    res.status(500).json({ error: 'Erreur téléchargement' });
  }
});

// Supprimer un PDF
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    await deleteFile(fileId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

module.exports = router;