const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getUserDetail,
  getStores,
} = require('../controllers/adminController');
const { validateAdminCreateUser, validateCreateStore } = require('../middleware/validateInput');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Every route here requires an authenticated ADMIN
router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.post('/users', validateAdminCreateUser, createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.post('/stores', validateCreateStore, createStore);
router.get('/stores', getStores);

module.exports = router;
