// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { downloadReport, getReportStats } = require('../controllers/reportController');

router.get('/stats', getReportStats);
router.get('/', downloadReport);

module.exports = router;