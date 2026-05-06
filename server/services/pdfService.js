const PDFDocument = require('pdfkit');

class PDFService {
  /**
   * Generate a PDF buffer from a report
   * @param {Object} testRun - The TestRun document
   * @param {Object} report - The Report document
   * @returns {Buffer} PDF buffer
   */
  async generatePDF(testRun, report) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          bufferPages: true
        });

        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // ── PAGE 1: Cover ──
        this._drawCover(doc, testRun, report);

        // ── PAGE 2+: Report Content ──
        doc.addPage();
        this._drawReportContent(doc, testRun);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  _drawCover(doc, testRun, report) {
    // Background header bar
    doc.rect(0, 0, doc.page.width, 200).fill('#6C63FF');
    
    // Title
    doc.fontSize(32).fillColor('#FFFFFF')
       .text('TestSense AI', 50, 60, { align: 'center' });
    doc.fontSize(14).fillColor('#E0DEFF')
       .text('Corporate Test Case Analysis Report', 50, 105, { align: 'center' });
    
    // Divider
    doc.rect(50, 145, doc.page.width - 100, 2).fill('#FFFFFF');

    // Build info
    doc.fontSize(12).fillColor('#FFFFFF')
       .text(`Build #${testRun.buildNumber || 'N/A'}  •  ${testRun.buildDate || 'N/A'}`, 50, 160, { align: 'center' });

    // Main info cards
    const yStart = 250;
    doc.fillColor('#1E1B2E');

    const infoItems = [
      { label: 'Build Number', value: testRun.buildNumber || 'N/A' },
      { label: 'Build Date', value: testRun.buildDate || 'N/A' },
      { label: 'Environment', value: testRun.environment || 'N/A' },
      { label: 'Total Tests', value: String(testRun.totalTests || 0) },
      { label: 'Passed', value: String(testRun.passed || 0) },
      { label: 'Failed', value: String(testRun.failed || 0) },
      { label: 'Pass Rate', value: `${testRun.passRate || 0}%` },
      { label: 'Health Grade', value: testRun.healthGrade || 'N/A' },
      { label: 'Release Decision', value: testRun.releaseDecision || 'UNKNOWN' }
    ];

    infoItems.forEach((item, i) => {
      const y = yStart + i * 35;
      doc.fontSize(11).fillColor('#6C63FF').text(item.label, 80, y);
      doc.fontSize(12).fillColor('#1E1B2E').text(item.value, 280, y);
    });

    // Overall Grade circle
    const grade = testRun.healthGrade || 'N/A';
    const gradeColor = this._gradeColor(grade);
    const cx = doc.page.width / 2;
    const cy = 620;
    doc.circle(cx, cy, 45).fill(gradeColor);
    doc.fontSize(36).fillColor('#FFFFFF').text(grade, cx - 20, cy - 18, { width: 40, align: 'center' });
    doc.fontSize(11).fillColor('#666').text('Overall Grade', cx - 50, cy + 50, { width: 100, align: 'center' });
  }

  _drawReportContent(doc, testRun) {
    const report = testRun.rawReport || 'No report content available.';
    
    // Split markdown into lines and render
    const lines = report.split('\n');
    let y = 50;

    for (const line of lines) {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }

      if (line.startsWith('## ')) {
        // Section header
        y += 10;
        doc.fontSize(16).fillColor('#6C63FF').text(line.replace('## ', ''), 50, y);
        y += 25;
        doc.rect(50, y, doc.page.width - 100, 1).fill('#E5E7EB');
        y += 10;
      } else if (line.startsWith('### ')) {
        doc.fontSize(13).fillColor('#374151').text(line.replace('### ', ''), 50, y);
        y += 20;
      } else if (line.startsWith('| ')) {
        // Table row
        doc.fontSize(9).fillColor('#1E1B2E').text(line, 50, y, { width: doc.page.width - 100 });
        y += 14;
      } else if (line.startsWith('- ')) {
        doc.fontSize(10).fillColor('#374151').text(`  •  ${line.slice(2)}`, 60, y, { width: doc.page.width - 120 });
        y += 16;
      } else if (line.trim() === '') {
        y += 8;
      } else {
        doc.fontSize(10).fillColor('#374151').text(line, 50, y, { width: doc.page.width - 100 });
        y += 14;
      }
    }
  }

  _gradeColor(grade) {
    const colors = {
      'A': '#22C55E', 'B': '#84CC16', 'C': '#F59E0B',
      'D': '#F97316', 'F': '#EF4444'
    };
    return colors[grade] || '#6B7280';
  }
}

module.exports = new PDFService();
