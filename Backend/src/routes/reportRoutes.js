// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { downloadReport } = require('../controllers/reportController');

router.get('/', downloadReport);

module.exports = router;