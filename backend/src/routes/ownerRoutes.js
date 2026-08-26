const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/ownerController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticateToken, authorizeRoles('STORE_OWNER'), getDashboard);

module.exports = router;
