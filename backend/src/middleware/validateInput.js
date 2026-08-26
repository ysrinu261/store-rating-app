const { body, param, query, validationResult } = require('express-validator');

// Central error handler — attach as the LAST item in any validation chain array.
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const nameRule = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters long.');

const addressRule = body('address')
  .trim()
  .isLength({ min: 1, max: 400 })
  .withMessage('Address is required and cannot exceed 400 characters.');

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Must be a valid email address.')
  .normalizeEmail();

const passwordRule = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be 8-16 characters long.')
  .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/)
  .withMessage('Password must contain at least one uppercase letter and one special character.');

// Public signup — always creates a NORMAL_USER
const validateSignup = [nameRule, addressRule, emailRule, passwordRule, handleValidation];

// Admin creating a user (normal user or admin) — same field rules, plus role
const validateAdminCreateUser = [
  nameRule,
  addressRule,
  emailRule,
  passwordRule,
  body('role')
    .optional()
    .isIn(['ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
    .withMessage('Role must be ADMIN, NORMAL_USER, or STORE_OWNER.'),
  handleValidation,
];

// Admin creating a store + its owner in one go
const validateCreateStore = [
  body('storeName').trim().isLength({ min: 1, max: 60 }).withMessage('Store name is required (max 60 chars).'),
  body('storeEmail').trim().isEmail().withMessage('Store email must be valid.').normalizeEmail(),
  body('storeAddress').trim().isLength({ min: 1, max: 400 }).withMessage('Store address is required (max 400 chars).'),
  body('ownerName').trim().isLength({ min: 20, max: 60 }).withMessage('Owner name must be between 20 and 60 characters long.'),
  body('ownerEmail').trim().isEmail().withMessage('Owner email must be valid.').normalizeEmail(),
  body('ownerAddress').trim().isLength({ min: 1, max: 400 }).withMessage('Owner address is required (max 400 chars).'),
  body('ownerPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Owner password must be 8-16 characters long.')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/)
    .withMessage('Owner password must contain at least one uppercase letter and one special character.'),
  handleValidation,
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Must be a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be 8-16 characters long.')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/)
    .withMessage('New password must contain at least one uppercase letter and one special character.'),
  handleValidation,
];

const validateRating = [
  param('storeId').isUUID().withMessage('Invalid store id.'),
  body('value').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateSignup,
  validateAdminCreateUser,
  validateCreateStore,
  validateLogin,
  validatePasswordUpdate,
  validateRating,
};
