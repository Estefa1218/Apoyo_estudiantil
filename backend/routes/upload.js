// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Middleware para subir archivos (solo 1 archivo, tipo Excel)
const multer = require('multer');
const storage = multer.memoryStorage(); // Guardar en memoria (no en disco)
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .xlsx'), false);
    }
  }
});

router.post('/upload', upload.single('excelFile'), uploadController.handleUpload);

module.exports = router;