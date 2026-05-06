const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const { analyse } = require('../controllers/analyseController');

// Rate limit: 10 requests per user per hour
const analyseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user?.id || 'anonymous',
  message: { message: 'Analysis rate limit exceeded. Maximum 10 analyses per hour.' },
  validate: { xForwardedForHeader: false }
});

router.post('/', protect, analyseLimiter, analyse);

module.exports = router;
