const express = require('express');
const router = express.Router();
const {
  getAllSpaces,
  getSpaceById,
  checkAvailability,
  createSpace,
  updateSpace
} = require('../controllers/spaceController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllSpaces);
router.get('/availability', checkAvailability);
router.get('/:id', getSpaceById);

// Admin routes
router.post('/', authenticateToken, isAdmin, createSpace);
router.put('/:id', authenticateToken, isAdmin, updateSpace);

module.exports = router;
