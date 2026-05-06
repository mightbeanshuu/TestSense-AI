import { useState, useCallback, useRef } from 'react';

/**
 * Hook for SSE-based streaming analysis.
 * Connects to /api/analyse and streams the AI response token by token.
 */
export function useAnalysis() {
  const [status, setStatus] = useState('idle'); // idle | streaming | complete | error
  const [report, setReport] = useState('');
  const [reportId, setReportId] = useState(null);
  const [testRunId, setTestRunId] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const analyse = useCallback(async (data) => {
    setStatus('streaming');
    setReport('');
    setReportId(null);
    setTestRunId(null);
    setMetadata(null);
    setError(null);

    const token = localStorage.getItem('testsense_token');
    if (!token) {
      setError('Not authenticated. Please login.');
      setStatus('error');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Analysis failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullReport = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              
              if (parsed.type === 'chunk') {
                fullReport += parsed.text;
                setReport(fullReport);
              } else if (parsed.type === 'complete') {
                setReportId(parsed.reportId);
                setTestRunId(parsed.testRunId);
                setMetadata(parsed.metadata);
                setStatus('complete');
              } else if (parsed.type === 'error') {
                throw new Error(parsed.message);
              }
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.includes('JSON')) {
                throw parseErr;
              }
            }
          }
        }
      }

      if (fullReport && status !== 'complete') {
        setStatus('complete');
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      setStatus('error');
    }
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setStatus('idle');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setReport('');
    setReportId(null);
    setTestRunId(null);
    setMetadata(null);
    setError(null);
  }, []);

  return { status, report, reportId, testRunId, metadata, error, analyse, abort, reset };
}

export default useAnalysis;
