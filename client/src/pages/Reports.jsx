import { useState, useEffect } from 'react';
import { api } from '../hooks/useAuth';
import { FileText, Trash2, Share2, Download, Link, Loader2, ExternalLink } from 'lucide-react';
import { exportPDF } from '../utils/exportPDF';
import toast from 'react-hot-toast';

export default function Reports({ darkMode }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report deleted');
    } catch (err) {
      toast.error('Failed to delete report');
    }
  }

  async function handleShare(id) {
    try {
      const res = await api.get(`/reports/${id}/share`);
      await navigator.clipboard.writeText(res.data.shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to create share link');
    }
  }

  async function handlePDF(id) {
    try {
      await exportPDF(id);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(err.message || 'PDF download failed');
    }
  }

  const gradeColor = (grade) => {
    const map = { A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#EF4444' };
    return map[grade] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText size={22} className="text-primary" />
          Reports
        </h1>
        <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
          {reports.length} reports generated
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report, i) => (
            <div key={report._id} className="card p-5 flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="grade-circle flex-shrink-0"
                style={{ 
                  width: '44px', height: '44px', fontSize: '18px',
                  background: `linear-gradient(135deg, ${gradeColor(report.healthGrade)}, ${gradeColor(report.healthGrade)}cc)` 
                }}>
                {report.healthGrade || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{report.title}</p>
                <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                  Build #{report.buildNumber} • {report.buildDate} • {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePDF(report._id)}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  title="Download PDF"
                >
                  <Download size={14} className="text-primary" />
                </button>
                <button
                  onClick={() => handleShare(report._id)}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  title="Copy share link"
                >
                  <Share2 size={14} className="text-primary" />
                </button>
                <button
                  onClick={() => handleDelete(report._id)}
                  className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                  title="Delete report"
                >
                  <Trash2 size={14} className="text-danger/60 hover:text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileText size={40} className="mx-auto mb-4 text-primary opacity-40" />
          <p className="font-medium">No reports yet</p>
          <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
            Run an analysis to generate your first report
          </p>
        </div>
      )}
    </div>
  );
}
