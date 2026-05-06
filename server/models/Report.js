const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reportSchema = new mongoose.Schema({
  testRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRun',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Analysis Report'
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
    default: () => uuidv4()
  },
  buildNumber: String,
  buildDate: String,
  healthGrade: String,
  releaseDecision: String,
  summary: String
}, {
  timestamps: true
});

reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
