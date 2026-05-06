const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Report = require('../models/Report');
const TestRun = require('../models/TestRun');
const pdfService = require('../services/pdfService');
const { getFlakyTests } = require('../controllers/historyController');

// GET /api/reports — list all reports for user
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id/pdf — generate and download PDF
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const testRun = await TestRun.findById(report.testRunId);
    if (!testRun) {
      return res.status(404).json({ message: 'Associated test run not found' });
    }

    const pdfBuffer = await pdfService.generatePDF(testRun, report);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="TestSense_Build_${report.buildNumber || 'Report'}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// GET /api/reports/:id/share — get or create shareable link
router.get('/:id/share', protect, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${report.shareToken}`;
    res.json({ shareUrl, shareToken: report.shareToken });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ message: 'Failed to generate share link' });
  }
});

// GET /api/reports/shared/:token — public read-only access
router.get('/shared/:token', async (req, res) => {
  try {
    const report = await Report.findOne({ shareToken: req.params.token });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const testRun = await TestRun.findById(report.testRunId)
      .select('-userId -testCases -historicalLogs')
      .lean();

    res.json({ report, testRun });
  } catch (error) {
    console.error('Shared report error:', error);
    res.status(500).json({ message: 'Failed to fetch shared report' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

// GET /api/flaky — all flaky tests for user
router.get('/flaky/all', protect, getFlakyTests);

module.exports = router;
