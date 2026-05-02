const express = require('express');
const router = express.Router();
const {
  getCargas,
  getCargaStudents,
  updateStudentStatus
} = require('../controllers/cargaController');

router.get('/', getCargas);
router.get('/:cargaId/estudiantes', getCargaStudents);
router.put('/:cargaId/estudiantes/:estudianteCargaId', updateStudentStatus);

module.exports = router;
