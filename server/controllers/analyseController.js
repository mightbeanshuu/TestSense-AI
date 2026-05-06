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
    // Strategy 1: Look for "Total tests | Passed | Failed | Skipped | Blocked: X | Y | Z | ..."
    const pipedStats = report.match(/Total\s+tests?\s*\|[^:]*:\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)/i);
    if (pipedStats) {
      metadata.totalTests = parseInt(pipedStats[1]);
      metadata.passed = parseInt(pipedStats[2]);
      metadata.failed = parseInt(pipedStats[3]);
      metadata.skipped = parseInt(pipedStats[4]);
    }

    // Strategy 2: Look for individual labels
    if (metadata.totalTests === 0) {
      const totalMatch = report.match(/Total\s+tests?\s*[:|]\s*(\d+)/i);
      const passedMatch = report.match(/Passed\s*[:|]\s*(\d+)/i);
      const failedMatch = report.match(/Failed\s*[:|]\s*(\d+)/i);
      const skippedMatch = report.match(/Skipped\s*[:|]\s*(\d+)/i);

      if (totalMatch) metadata.totalTests = parseInt(totalMatch[1]);
      if (passedMatch) metadata.passed = parseInt(passedMatch[1]);
      if (failedMatch) metadata.failed = parseInt(failedMatch[1]);
      if (skippedMatch) metadata.skipped = parseInt(skippedMatch[1]);
    }

    // Strategy 3: Count from test categorization table
    if (metadata.totalTests === 0) {
      const stablePassing = (report.match(/STABLE.PASSING/gi) || []).length;
      const regression = (report.match(/REGRESSION/gi) || []).length;
      const flaky = (report.match(/FLAKY/gi) || []).length;
      const failing = (report.match(/CONSISTENTLY.FAILING/gi) || []).length;
      const newTest = (report.match(/NEW.TEST/gi) || []).length;
      const fixed = (report.match(/FIXED/gi) || []).length;
      const skipped = (report.match(/SKIPPED|BLOCKED/gi) || []).length;
      
      const totalFromTable = stablePassing + regression + flaky + failing + newTest + fixed + skipped;
      if (totalFromTable > 5) {
        // Only use this if we found a meaningful number (dividing by 2 since categories appear in header + rows)
        metadata.totalTests = Math.round(totalFromTable / 2);
        metadata.passed = Math.round(stablePassing / 2) + Math.round(fixed / 2);
        metadata.failed = Math.round(regression / 2) + Math.round(failing / 2);
      }
    }

    // Calculate pass rate
    if (metadata.totalTests > 0) {
      metadata.passRate = Math.round((metadata.passed / metadata.totalTests) * 100);
    } else {
      // Try to extract from report text directly
      const rateMatch = report.match(/pass\s*rate[:\s]*(\d+(?:\.\d+)?)\s*%/i);
      if (rateMatch) {
        metadata.passRate = Math.round(parseFloat(rateMatch[1]));
      }
    }

    // Extract release decision — more robust matching
    const releaseSection = report.match(/SAFE TO RELEASE[\s\S]{0,200}/i) || [''];
    const releaseText = releaseSection[0];
    
    if (/\bNO\b/i.test(releaseText) && !/\bYES\b/i.test(releaseText)) {
      metadata.releaseDecision = 'DO_NOT_RELEASE';
    } else if (/\bCONDITIONAL\b/i.test(releaseText)) {
      metadata.releaseDecision = 'CONDITIONAL';
    } else if (/\bYES\b/i.test(releaseText)) {
      metadata.releaseDecision = 'SAFE';
    }
    
    // Fallback: check for bold NO or standalone patterns
    if (metadata.releaseDecision === 'UNKNOWN') {
      if (/DO\s*NOT\s*RELEASE|NOT\s+SAFE/i.test(report)) {
        metadata.releaseDecision = 'DO_NOT_RELEASE';
      } else if (/CONDITIONAL/i.test(report) && /RELEASE/i.test(report)) {
        metadata.releaseDecision = 'CONDITIONAL';
      }
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
