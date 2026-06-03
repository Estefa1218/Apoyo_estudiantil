// src/routes/derivacionRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  addDerivacion,
  deleteDerivacion,
  getDerivacionesByCarga,
  addRecurso,
  getRecursosByEstudiante,
  updateRecurso,
  deleteRecurso,
  downloadRecurso
} = require('../controllers/derivacionController');

// Configurar multer para archivos
const upload = multer({
  dest: process.env.UPLOAD_DIR || 'uploads/recursos/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Permitir archivos PDF, documentos y presentaciones
    const extensionesPermitidas = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i;
    if (!extensionesPermitidas.test(file.originalname)) {
      return cb(new Error('Formato de archivo no permitido'), false);
    }
    cb(null, true);
  }
});

// ============ RUTAS DE DERIVACIÓN ============

// Agregar derivación
router.post('/derivacion', addDerivacion);

// Eliminar derivación
router.delete('/derivacion/:estudianteCargaId/:cargaId', deleteDerivacion);

// Obtener derivaciones de una carga
router.get('/derivaciones/:cargaId', getDerivacionesByCarga);

// ============ RUTAS DE RECURSOS ============

// Agregar recurso (con opción de archivo o URL)
router.post('/recurso', upload.single('archivo'), addRecurso);

// Obtener recursos de un estudiante
router.get('/recursos/:estudianteCargaId', getRecursosByEstudiante);

// Actualizar recurso
router.put('/recurso/:recursoId', upload.single('archivo'), updateRecurso);

// Eliminar recurso
router.delete('/recurso/:recursoId', deleteRecurso);

// Descargar recurso
router.get('/recurso/descargar/:recursoId', downloadRecurso);

module.exports = router;
