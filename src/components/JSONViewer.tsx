import { useState } from 'react';
import { FileCode, Download, Copy, Check } from 'lucide-react';
import { formatToCSV } from '../utils/statistics';
import type { SeriesData } from '../utils/statistics';

interface JSONViewerProps {
  rawData: any; // Raw JSON response
  dataSeries: SeriesData[];
}

export function JSONViewer({ rawData, dataSeries }: JSONViewerProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(rawData, null, 2);
  const csvString = formatToCSV(dataSeries);

  const handleCopy = async () => {
    try {
      const textToCopy = activeTab === 'json' ? jsonString : csvString;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const content = activeTab === 'json' ? jsonString : csvString;
    const mime = activeTab === 'json' ? 'application/json' : 'text/csv';
    const ext = activeTab === 'json' ? 'json' : 'csv';
    
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digitized_graph_dataset.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel" style={styles.container}>
      {/* Header controls */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCode size={18} className="text-gradient" />
          <h3 style={{ fontSize: '16px' }}>Export Data Hub</h3>
        </div>

        {/* Tab Controls */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setActiveTab('json')}
            style={{
              ...styles.tab,
              color: activeTab === 'json' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'json' ? 'var(--primary)' : 'transparent'
            }}
          >
            Structured JSON
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            style={{
              ...styles.tab,
              color: activeTab === 'csv' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'csv' ? 'var(--primary)' : 'transparent'
            }}
          >
            Tabular CSV
          </button>
        </div>

        {/* Action buttons */}
        <div style={styles.actions}>
          <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', gap: '4px' }}>
            {copied ? (
              <>
                <Check size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>

          <button onClick={handleDownload} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', gap: '4px' }}>
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Editor Preview Window */}
      <div style={styles.editorArea}>
        {activeTab === 'json' ? (
          <pre className="mono" style={styles.pre}>
            <code>{jsonString}</code>
          </pre>
        ) : (
          <pre className="mono" style={styles.pre}>
            <code>{csvString || 'No data generated to export yet.'}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  tabBar: {
    display: 'flex',
    gap: '16px',
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '6px 4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editorArea: {
    backgroundColor: '#030712',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    padding: '16px',
    maxHeight: '400px',
    overflow: 'auto' as const,
  },
  pre: {
    margin: 0,
    color: '#00f2fe',
    fontSize: '12px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap' as const,
  }
};
