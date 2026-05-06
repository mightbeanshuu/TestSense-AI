const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getHistory, getBuild, deleteBuild, getFlakyTests } = require('../controllers/historyController');

router.get('/', protect, getHistory);
router.get('/:buildId', protect, getBuild);
router.delete('/:buildId', protect, deleteBuild);

module.exports = router;
