const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  login,
  registerAdmin,
  registerAdminWithGoogle,
  registerEmployee,
  registerEmployeeWithGoogle,
  getMe,
  loginWithGoogle,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/google/login', loginWithGoogle);
router.post('/register/admin', registerAdmin);
router.post('/google/register/admin', registerAdminWithGoogle);
router.post('/register/employee', registerEmployee);
router.post('/google/register/employee', registerEmployeeWithGoogle);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getMe);

module.exports = router;