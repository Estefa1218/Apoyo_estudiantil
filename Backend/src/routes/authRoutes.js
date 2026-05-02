const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', authenticateToken, me);

module.exports = router;
