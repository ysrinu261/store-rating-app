const express = require('express');
const router = express.Router();
const { signup, login, updatePassword, me } = require('../controllers/authController');
const { validateSignup, validateLogin, validatePasswordUpdate } = require('../middleware/validateInput');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.patch('/update-password', authenticateToken, validatePasswordUpdate, updatePassword);
router.get('/me', authenticateToken, me);

module.exports = router;
