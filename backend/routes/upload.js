// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const { handleUpload, handleDownload } = require('../controllers/uploadController');

const router = express.Router();

// Configuración de Multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo archivos Excel
    if (file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  }
});

// Ruta para subir archivo Excel
router.post('/upload', upload.single('excelFile'), handleUpload);

// Ruta para descargar archivo procesado
router.get('/download/:fileName', handleDownload);

module.exports = router;