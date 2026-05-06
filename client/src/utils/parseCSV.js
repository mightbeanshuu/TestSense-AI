import Papa from 'papaparse';

/**
 * Parse CSV text into structured test case data.
 * Expected columns: ID, Name, Steps, Expected, Actual, Status
 */
export function parseCSV(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parse warnings:', results.errors);
        }
        
        const testCases = results.data.map((row, index) => ({
          id: row.ID || row.id || row['Test ID'] || `TC${String(index + 1).padStart(3, '0')}`,
          name: row.Name || row.name || row['Test Name'] || row.Title || '',
          steps: row.Steps || row.steps || row['Test Steps'] || '',
          expected: row.Expected || row.expected || row['Expected Result'] || row['Expected Output'] || '',
          actual: row.Actual || row.actual || row['Actual Result'] || row['Actual Output'] || '',
          status: row.Status || row.status || row.Result || 'UNKNOWN'
        }));

        resolve(testCases);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

/**
 * Parse CSV from a File object
 */
export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await parseCSV(e.target.result);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default parseCSV;
