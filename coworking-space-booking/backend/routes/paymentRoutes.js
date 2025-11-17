const express = require('express');
const router = express.Router();
const {
  processDepositPayment,
  processBalancePayment,
  getBookingPayments,
  getUserPayments
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.post('/deposit', processDepositPayment);
router.post('/balance', processBalancePayment);
router.get('/booking/:bookingId', getBookingPayments);
router.get('/my-payments', getUserPayments);

module.exports = router;
