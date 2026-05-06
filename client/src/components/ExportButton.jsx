import { useState } from 'react';
import { Download, FileText, Copy, ChevronDown, Check, Loader2 } from 'lucide-react';
import { exportPDF, copyToClipboard } from '../utils/exportPDF';
import toast from 'react-hot-toast';

export default function ExportButton({ reportId, reportText, darkMode }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePDF = async () => {
    if (!reportId) {
      toast.error('Report not saved yet');
      return;
    }
    setDownloading(true);
    try {
      await exportPDF(reportId);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(err.message || 'PDF download failed');
    } finally {
      setDownloading(false);
      setOpen(false);
    }
  };

  const handleCopy = async () => {
    if (!reportText) return;
    await copyToClipboard(reportText);
    setCopied(true);
    toast.success('Report copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost text-sm"
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1 z-50 card animate-slide-up"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <button
              onClick={handlePDF}
              disabled={downloading}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Download PDF
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
