const aiService = require('../services/claudeService');
const TestRun = require('../models/TestRun');
const Report = require('../models/Report');

/**
 * POST /api/analyse
 * Accepts test case data, streams AI analysis via SSE, saves to DB.
 */
exports.analyse = async (req, res) => {
  try {
    const { testCases, buildNumber, buildDate, environment, historicalLogs } = req.body;

    // Validate: test cases are required
    if (!testCases || (typeof testCases === 'string' && testCases.trim() === '') ||
        (Array.isArray(testCases) && testCases.length === 0)) {
      return res.status(400).json({ message: 'Test cases are required. Please provide at least one test case.' });
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const buildInfo = { buildNumber, buildDate, environment };
    let fullReport = '';
    let aborted = false;

    // Handle client disconnect
    req.on('close', () => {
      aborted = true;
    });

    try {
      // Stream AI response
      for await (const chunk of aiService.streamAnalysis(testCases, buildInfo, historicalLogs)) {
        if (aborted) break;
        fullReport += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
      }

      if (aborted) return;

      // Parse report for metadata
      const metadata = parseReportMetadata(fullReport);

      // Save TestRun to DB
      const testRun = await TestRun.create({
        userId: req.user.id,
        buildNumber: buildNumber || 'N/A',
        buildDate: buildDate || new Date().toISOString().split('T')[0],
        environment: environment || 'N/A',
        testCases,
        historicalLogs: historicalLogs || '',
        rawReport: fullReport,
        parsedReport: metadata,
        scorecard: metadata.scorecard || {},
        releaseDecision: metadata.releaseDecision || 'UNKNOWN',
        totalTests: metadata.totalTests || 0,
        passed: metadata.passed || 0,
        failed: metadata.failed || 0,
        skipped: metadata.skipped || 0,
        passRate: metadata.passRate || 0,
        healthGrade: metadata.healthGrade || 'N/A',
        flakyTests: metadata.flakyTests || []
      });

      // Save Report
      const report = await Report.create({
        testRunId: testRun._id,
        userId: req.user.id,
        title: `Build ${buildNumber || 'N/A'} Analysis`,
        buildNumber: buildNumber || 'N/A',
        buildDate: buildDate || new Date().toISOString().split('T')[0],
        healthGrade: metadata.healthGrade || 'N/A',
        releaseDecision: metadata.releaseDecision || 'UNKNOWN',
        summary: fullReport.substring(0, 500)
      });

      // Send completion event
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        reportId: report._id,
        testRunId: testRun._id,
        metadata
      })}\n\n`);

    } catch (aiError) {
      console.error('AI Service error:', aiError);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: aiError.message || 'AI analysis failed. Please check your API key and try again.'
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Analyse error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Analysis failed. Please try again.' });
    }
  }
};

/**
 * Parse the markdown report to extract metadata like scores, grades, etc.
 */
function parseReportMetadata(report) {
  const metadata = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    passRate: 0,
    healthGrade: 'N/A',
    releaseDecision: 'UNKNOWN',
    scorecard: {},
    flakyTests: []
  };

  try {
    // Extract build stats from BUILD ANALYSIS section
    const totalMatch = report.match(/Total\s+tests?\s*[:|]\s*(\d+)/i);
    const passedMatch = report.match(/Passed\s*[:|]\s*(\d+)/i);
    const failedMatch = report.match(/Failed\s*[:|]\s*(\d+)/i);
    const skippedMatch = report.match(/Skipped\s*[:|]\s*(\d+)/i);

    if (totalMatch) metadata.totalTests = parseInt(totalMatch[1]);
    if (passedMatch) metadata.passed = parseInt(passedMatch[1]);
    if (failedMatch) metadata.failed = parseInt(failedMatch[1]);
    if (skippedMatch) metadata.skipped = parseInt(skippedMatch[1]);

    if (metadata.totalTests > 0) {
      metadata.passRate = Math.round((metadata.passed / metadata.totalTests) * 100);
    }

    // Extract release decision
    if (/SAFE TO RELEASE.*YES/i.test(report) || /YES.*SAFE TO RELEASE/i.test(report)) {
      metadata.releaseDecision = 'SAFE';
    } else if (/CONDITIONAL/i.test(report) && /RELEASE/i.test(report)) {
      metadata.releaseDecision = 'CONDITIONAL';
    } else if (/NO.*SAFE TO RELEASE|DO NOT RELEASE|NOT.*SAFE/i.test(report)) {
      metadata.releaseDecision = 'DO_NOT_RELEASE';
    }

    // Extract overall grade from scorecard
    const gradeMatch = report.match(/Overall\s+QA\s+Health\s*\|[^|]*\|\s*([A-F])/i);
    if (gradeMatch) {
      metadata.healthGrade = gradeMatch[1];
    } else {
      // Try to compute from pass rate
      if (metadata.passRate >= 90) metadata.healthGrade = 'A';
      else if (metadata.passRate >= 80) metadata.healthGrade = 'B';
      else if (metadata.passRate >= 70) metadata.healthGrade = 'C';
      else if (metadata.passRate >= 60) metadata.healthGrade = 'D';
      else if (metadata.totalTests > 0) metadata.healthGrade = 'F';
    }

    // Extract scorecard rows
    const scorecardSection = report.match(/FINAL SCORECARD[\s\S]*?\|[\s\S]*?(?=\n---|\n##|$)/i);
    if (scorecardSection) {
      const rows = scorecardSection[0].match(/\|\s*([^|]+)\|\s*(\d+)\s*\|\s*([A-F])\s*\|/gi);
      if (rows) {
        rows.forEach(row => {
          const parts = row.split('|').filter(p => p.trim());
          if (parts.length >= 3) {
            const metric = parts[0].trim();
            const score = parseInt(parts[1].trim());
            const grade = parts[2].trim();
            metadata.scorecard[metric] = { score, grade };
          }
        });
      }
    }

    // Extract flaky tests
    const flakySection = report.match(/FLAKY TEST DEEP ANALYSIS[\s\S]*?(?=\n---|\n## [^🎲])/i);
    if (flakySection) {
      const flakyMatches = flakySection[0].match(/(?:TC\d+|[A-Z]+-\d+)\s*\|[^|]*\d+%/gi);
      if (flakyMatches) {
        flakyMatches.forEach(match => {
          const parts = match.split('|').map(p => p.trim());
          if (parts.length >= 2) {
            metadata.flakyTests.push({
              testId: parts[0],
              flakinessScore: parseInt(parts[1]) || 0,
              testName: parts[0],
              recommendation: 'MONITOR'
            });
          }
        });
      }
    }

  } catch (err) {
    console.error('Error parsing report metadata:', err);
  }

  return metadata;
}
