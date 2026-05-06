const TestRun = require('../models/TestRun');
const Report = require('../models/Report');

// GET /api/history — all builds for user
exports.getHistory = async (req, res) => {
  try {
    const builds = await TestRun.find({ userId: req.user.id })
      .select('buildNumber buildDate environment totalTests passed failed skipped passRate healthGrade releaseDecision createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ builds });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// GET /api/history/:buildId — single build report
exports.getBuild = async (req, res) => {
  try {
    const build = await TestRun.findOne({
      _id: req.params.buildId,
      userId: req.user.id
    }).lean();

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    res.json({ build });
  } catch (error) {
    console.error('Get build error:', error);
    res.status(500).json({ message: 'Failed to fetch build' });
  }
};

// DELETE /api/history/:buildId — delete a build
exports.deleteBuild = async (req, res) => {
  try {
    const build = await TestRun.findOneAndDelete({
      _id: req.params.buildId,
      userId: req.user.id
    });

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    // Also delete associated report
    await Report.deleteMany({ testRunId: build._id });

    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Delete build error:', error);
    res.status(500).json({ message: 'Failed to delete build' });
  }
};

// GET /api/flaky — all flaky tests across user builds
exports.getFlakyTests = async (req, res) => {
  try {
    const builds = await TestRun.find({ userId: req.user.id })
      .select('buildNumber buildDate flakyTests passRate createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate flaky tests across all builds
    const flakyMap = new Map();

    builds.forEach(build => {
      if (build.flakyTests && build.flakyTests.length > 0) {
        build.flakyTests.forEach(ft => {
          const key = ft.testId || ft.testName;
          if (!flakyMap.has(key)) {
            flakyMap.set(key, {
              testId: ft.testId,
              testName: ft.testName || ft.testId,
              flakinessScore: ft.flakinessScore || 0,
              passRate: ft.passRate || 0,
              pattern: ft.pattern || 'Unknown',
              rootCause: ft.rootCause || 'Unknown',
              recommendation: ft.recommendation || 'MONITOR',
              history: [],
              firstSeen: build.buildDate,
              lastSeen: build.buildDate,
              buildCount: 0
            });
          }

          const existing = flakyMap.get(key);
          existing.history.push({
            build: build.buildNumber,
            date: build.buildDate,
            flakinessScore: ft.flakinessScore || 0
          });
          existing.buildCount++;
          // Update to highest flakiness score
          if ((ft.flakinessScore || 0) > existing.flakinessScore) {
            existing.flakinessScore = ft.flakinessScore;
            existing.recommendation = ft.recommendation || existing.recommendation;
          }
          existing.lastSeen = build.buildDate;
        });
      }
    });

    res.json({ flakyTests: Array.from(flakyMap.values()) });
  } catch (error) {
    console.error('Get flaky tests error:', error);
    res.status(500).json({ message: 'Failed to fetch flaky tests' });
  }
};
