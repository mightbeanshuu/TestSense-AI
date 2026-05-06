/**
 * Parse a markdown report into structured sections for rendering.
 */
export function formatReport(markdown) {
  if (!markdown) return { sections: [], raw: '' };

  const sections = [];
  const lines = markdown.split('\n');
  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const title = line.replace('## ', '').trim();
      currentSection = {
        id: title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        title,
        content: '',
        emoji: extractEmoji(title)
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { sections, raw: markdown };
}

function extractEmoji(title) {
  const emojiMatch = title.match(/^[\p{Emoji}\u200d\ufe0f]+/u);
  return emojiMatch ? emojiMatch[0] : '📋';
}

/**
 * Extract release decision from report text
 */
export function extractReleaseDecision(markdown) {
  if (!markdown) return 'UNKNOWN';
  
  if (/SAFE TO RELEASE.*YES/i.test(markdown) || /YES.*safe/i.test(markdown)) {
    return 'SAFE';
  } else if (/CONDITIONAL/i.test(markdown)) {
    return 'CONDITIONAL';
  } else if (/NO.*SAFE|DO NOT RELEASE|NOT.*SAFE/i.test(markdown)) {
    return 'DO_NOT_RELEASE';
  }
  return 'UNKNOWN';
}

/**
 * Extract scorecard from markdown
 */
export function extractScorecard(markdown) {
  const scores = [];
  const scorecardMatch = markdown.match(/FINAL SCORECARD[\s\S]*?(?=\n---|\n## |$)/i);
  
  if (scorecardMatch) {
    const rows = scorecardMatch[0].match(/\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*([A-F])\s*\|/g);
    if (rows) {
      rows.forEach(row => {
        const parts = row.split('|').filter(p => p.trim());
        if (parts.length >= 3) {
          scores.push({
            metric: parts[0].trim(),
            score: parseInt(parts[1].trim()),
            grade: parts[2].trim()
          });
        }
      });
    }
  }

  return scores;
}

export default formatReport;
