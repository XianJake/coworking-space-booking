const express = require('express');
const router = express.Router();
const {
  getAllMembershipPlans,
  subscribeToPlan,
  cancelMembership
} = require('../controllers/membershipController');
const { authenticateToken } = require('../middleware/auth');

// Public route
router.get('/plans', getAllMembershipPlans);

// Protected routes
router.post('/subscribe', authenticateToken, subscribeToPlan);
router.post('/cancel', authenticateToken, cancelMembership);

module.exports = router;
