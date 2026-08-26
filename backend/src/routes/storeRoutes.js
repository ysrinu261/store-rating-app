const express = require('express');
const router = express.Router();
const { getStoresForUser, submitRating } = require('../controllers/storeController');
const { validateRating } = require('../middleware/validateInput');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, authorizeRoles('NORMAL_USER', 'ADMIN'), getStoresForUser);
router.post('/:storeId/rate', authenticateToken, authorizeRoles('NORMAL_USER'), validateRating, submitRating);

module.exports = router;
