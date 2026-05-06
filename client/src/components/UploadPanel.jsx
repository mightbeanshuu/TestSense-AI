import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Code, Table, FileSpreadsheet, Calendar, Hash, Server, Clock, Loader2, Zap, AlertCircle } from 'lucide-react';
import { parseCSV } from '../utils/parseCSV';
import * as XLSX from 'xlsx';

const INPUT_TABS = [
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'csv', label: 'CSV', icon: Table },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'json', label: 'JSON', icon: Code },
];

export default function UploadPanel({ onAnalyse, isStreaming, darkMode }) {
  const [activeTab, setActiveTab] = useState('text');
  const [testCaseText, setTestCaseText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [buildDate, setBuildDate] = useState(new Date().toISOString().split('T')[0]);
  const [environment, setEnvironment] = useState('Production');
  const [historicalLogs, setHistoricalLogs] = useState('');
  const [error, setError] = useState('');

  const charCount = activeTab === 'text' ? testCaseText.length : 
                    activeTab === 'json' ? jsonText.length : 0;

  const rowCount = parsedData ? (Array.isArray(parsedData) ? parsedData.length : 0) : 0;

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    setError('');
    setFileName(file.name);

    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const parsed = await parseCSV(text);
        setParsedData(parsed);
        setActiveTab('csv');
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const parsed = jsonData.map((row, i) => ({
          id: row.ID || row.id || row['Test ID'] || `TC${String(i + 1).padStart(3, '0')}`,
          name: row.Name || row.name || row['Test Name'] || '',
          steps: row.Steps || row.steps || '',
          expected: row.Expected || row.expected || row['Expected Result'] || '',
          actual: row.Actual || row.actual || row['Actual Result'] || '',
          status: row.Status || row.status || 'UNKNOWN'
        }));
        setParsedData(parsed);
        setActiveTab('excel');
      }
    } catch (err) {
      setError(`Failed to parse file: ${err.message}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleSubmit = () => {
    setError('');
    
    let testCases;
    
    if (activeTab === 'text') {
      if (!testCaseText.trim()) {
        setError('Please enter your test cases');
        return;
      }
      testCases = testCaseText;
    } else if (activeTab === 'json') {
      if (!jsonText.trim()) {
        setError('Please enter JSON test case data');
        return;
      }
      try {
        testCases = JSON.parse(jsonText);
      } catch {
        setError('Invalid JSON format');
        return;
      }
    } else {
      if (!parsedData || parsedData.length === 0) {
        setError('Please upload a file with test case data');
        return;
      }
      testCases = parsedData;
    }

    onAnalyse({
      testCases,
      buildNumber: buildNumber || undefined,
      buildDate: buildDate || undefined,
      environment: environment || undefined,
      historicalLogs: historicalLogs || undefined
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Input tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{
        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
      }}>
        {INPUT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id ? 'text-white shadow-lg' : ''
            }`}
            style={activeTab === id ? {
              background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
              boxShadow: '0 4px 12px rgba(108,99,255,0.3)'
            } : {
              color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)'
            }}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="card p-5">
        {(activeTab === 'text') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Test Cases</label>
            <textarea
              value={testCaseText}
              onChange={(e) => setTestCaseText(e.target.value)}
              placeholder="Paste your test cases here...&#10;&#10;Format: ID, Name, Steps, Expected, Actual, Status&#10;Or paste any format — AI will understand it."
              className="input-field min-h-[200px] resize-y font-mono text-sm"
              rows={10}
            />
            <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
              {charCount.toLocaleString()} characters
            </p>
          </div>
        )}

        {(activeTab === 'csv' || activeTab === 'excel') && (
          <div className="space-y-3">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : ''
              }`}
              style={{
                borderColor: isDragActive ? 'var(--color-primary)' : darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'
              }}
            >
              <input {...getInputProps()} />
              <Upload size={32} className="mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop your file here' : `Drag & drop a ${activeTab.toUpperCase()} file`}
              </p>
              <p className="text-xs mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                or click to browse • Max 10MB
              </p>
            </div>

            {fileName && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10">
                <FileText size={14} className="text-primary" />
                <span className="text-sm font-medium">{fileName}</span>
                <span className="text-xs text-primary ml-auto">{rowCount} rows</span>
              </div>
            )}

            {parsedData && parsedData.length > 0 && (
              <div className="overflow-x-auto max-h-[200px] rounded-lg" style={{
                border: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}`
              }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: darkMode ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.05)' }}>
                      {Object.keys(parsedData[0]).map(key => (
                        <th key={key} className="px-3 py-2 text-left font-semibold">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}` }}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 truncate max-w-[200px]">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <p className="text-xs text-center py-2" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                    + {parsedData.length - 5} more rows
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste JSON Array</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[
  {
    "id": "TC001",
    "name": "Login Test",
    "steps": "Enter credentials, click login",
    "expected": "Dashboard loads",
    "actual": "Dashboard loads",
    "status": "PASS"
  }
]`}
              className="input-field min-h-[200px] resize-y font-mono text-sm"
              rows={10}
            />
            <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
              {charCount.toLocaleString()} characters
            </p>
          </div>
        )}
      </div>

      {/* Build info fields */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Server size={14} className="text-primary" />
          Build Information <span className="text-xs font-normal" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>(optional)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <Hash size={12} /> Build Number
            </label>
            <input
              type="text"
              value={buildNumber}
              onChange={(e) => setBuildNumber(e.target.value)}
              placeholder="e.g. 142"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} /> Build Date
            </label>
            <input
              type="date"
              value={buildDate}
              onChange={(e) => setBuildDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <Server size={12} /> Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="input-field"
            >
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
              <option>QA</option>
              <option>UAT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical logs */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          Historical Logs <span className="text-xs font-normal" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>(optional)</span>
        </h3>
        <textarea
          value={historicalLogs}
          onChange={(e) => setHistoricalLogs(e.target.value)}
          placeholder="Paste previous build results here for trend analysis...&#10;e.g. Build 140: 95% pass, Build 141: 92% pass"
          className="input-field min-h-[100px] resize-y text-sm"
          rows={4}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl animate-slide-up"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} className="text-danger flex-shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Analyse button */}
      <button
        onClick={handleSubmit}
        disabled={isStreaming}
        className="btn-primary w-full justify-center py-4 text-base glow-primary"
      >
        {isStreaming ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Analysing...
          </>
        ) : (
          <>
            <Zap size={18} />
            Analyse Now
          </>
        )}
      </button>
      
      {!isStreaming && (
        <p className="text-xs text-center" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
          ⚡ Analysis takes ~10 seconds
        </p>
      )}
    </div>
  );
}
