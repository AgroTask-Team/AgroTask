const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const {
  getCurrentFarm,
  updateMemberStatus,
} = require('../controllers/farmController');

const router = express.Router();

router.get('/current', authMiddleware, getCurrentFarm);
router.patch('/members/:memberId/status', authMiddleware, requireAdmin, updateMemberStatus);

module.exports = router;