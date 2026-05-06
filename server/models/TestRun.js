const mongoose = require('mongoose');

const testRunSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  buildNumber: {
    type: String,
    default: 'N/A',
    index: true
  },
  buildDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  environment: {
    type: String,
    default: 'Production'
  },
  testCases: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  historicalLogs: {
    type: String,
    default: ''
  },
  rawReport: {
    type: String,
    default: ''
  },
  parsedReport: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  scorecard: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  releaseDecision: {
    type: String,
    enum: ['SAFE', 'CONDITIONAL', 'DO_NOT_RELEASE', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  totalTests: { type: Number, default: 0 },
  passed: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  passRate: { type: Number, default: 0 },
  healthGrade: { type: String, default: 'N/A' },
  flakyTests: [{
    testId: String,
    testName: String,
    flakinessScore: Number,
    passRate: Number,
    pattern: String,
    rootCause: String,
    recommendation: String,
    history: [{ build: String, status: String }]
  }]
}, {
  timestamps: true
});

// Index for efficient queries
testRunSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TestRun', testRunSchema);
