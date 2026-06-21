import { 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Layers, 
  Sparkles,
  MousePointerClick,
  History,
  Download,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { EXAMPLES } from '../utils/examples';
import type { ExampleGraph } from '../utils/examples';
import type { HistoryItem } from '../App';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  researchMode: boolean;
  setResearchMode: (mode: boolean) => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  onLoadExample: (example: ExampleGraph) => void;
  currentExampleId: string | null;
  historyList: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onDownloadHistoryItem: (item: HistoryItem, format: 'csv' | 'excel') => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  researchMode,
  setResearchMode,
  onOpenSettings,
  hasApiKey,
  onLoadExample,
  currentExampleId,
  historyList,
  onLoadHistory,
  onClearHistory,
  onDeleteHistoryItem,
  onDownloadHistoryItem
}: SidebarProps) {
  return (
    <aside className="glass-panel" style={styles.sidebar}>
      {/* Brand Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <BarChart3 size={24} style={{ color: '#060913' }} />
        </div>
        <div>
          <h2 style={styles.brandTitle}>
            AI <span className="text-gradient">Graph</span>
          </h2>
          <span style={styles.brandSubtitle}>Dataset Extractor</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div style={styles.section}>
        <span style={styles.sectionHeader}>Navigation</span>
        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab('extractor')}
            className={`btn btn-ghost ${activeTab === 'extractor' ? 'active' : ''}`}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'extractor' ? styles.navBtnActive : {})
            }}
          >
            <Layers size={18} />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`btn btn-ghost ${activeTab === 'calibration' ? 'active' : ''}`}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'calibration' ? styles.navBtnActive : {})
            }}
          >
            <MousePointerClick size={18} />
            <span>Manual Calibrate</span>
          </button>
        </nav>
      </div>

      {/* Mode Settings */}
      <div style={styles.section}>
        <span style={styles.sectionHeader}>Extraction Options</span>
        <div className="glass-panel" style={styles.optionsCard}>
          <div style={styles.toggleRow}>
            <div style={styles.toggleLabelContainer}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} className="text-gradient" />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Research Mode</span>
              </div>
              <p style={styles.toggleDesc}>Extracts CSV, curve fitting, and trend reports</p>
            </div>
            <label className="switch" style={styles.switch}>
              <input
                type="checkbox"
                checked={researchMode}
                onChange={(e) => setResearchMode(e.target.checked)}
                style={styles.switchInput}
              />
              <span className="slider" style={{
                ...styles.slider,
                backgroundColor: researchMode ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
              }}>
                <span style={{
                  ...styles.sliderKnob,
                  transform: researchMode ? 'translateX(18px)' : 'translateX(0)'
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Built-in Demos */}
      <div style={styles.section}>
        <span style={styles.sectionHeader}>Try Built-in Examples</span>
        <div style={styles.exampleList}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onLoadExample(ex)}
              style={{
                ...styles.exampleBtn,
                borderColor: currentExampleId === ex.id ? 'var(--primary)' : 'var(--border-glass)',
                backgroundColor: currentExampleId === ex.id ? 'rgba(128, 182, 161, 0.04)' : 'transparent'
              }}
            >
              <div style={styles.exampleInfo}>
                <span style={{
                  fontWeight: 500,
                  fontSize: '13px',
                  color: currentExampleId === ex.id ? 'var(--primary)' : '#fff'
                }}>
                  {ex.title}
                </span>
                <span style={styles.exampleMeta}>
                  Type: {ex.graph_type.toUpperCase()} • Confidence: {(ex.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div style={styles.section}>
        <span style={styles.sectionHeader}>Recent History</span>
        {historyList.length === 0 ? (
          <div style={styles.historyEmpty}>
            <History size={13} />
            <span>No local extractions</span>
          </div>
        ) : (
          <div style={styles.exampleList}>
            {historyList.map((item) => (
              <div key={item.id} className="history-item-row" style={styles.historyRowContainer}>
                <button
                  onClick={() => onLoadHistory(item)}
                  style={{
                    ...styles.exampleBtn,
                    flex: 1,
                    paddingRight: '75px'
                  }}
                >
                  <div style={styles.exampleInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '8px', padding: '1px 3px', textTransform: 'uppercase', flexShrink: 0 }}>
                        {item.graphType || 'line'}
                      </span>
                      <span style={{ fontWeight: 500, fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.fileName}
                      </span>
                    </div>
                    <span style={styles.exampleMeta}>
                      {item.timestamp} • {item.dataSeries[0]?.data.length || 0} pts
                    </span>
                  </div>
                </button>

                {/* Hover actions overlay */}
                <div style={styles.historyActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadHistoryItem(item, 'csv');
                    }}
                    className="history-action-btn"
                    title="Download CSV"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadHistoryItem(item, 'excel');
                    }}
                    className="history-action-btn"
                    title="Download Excel"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FileSpreadsheet size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="history-action-btn delete-btn"
                    title="Delete item"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={onClearHistory}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-rose)', fontSize: '11px', alignSelf: 'flex-start', padding: '4px' }}
            >
              Clear History
            </button>
          </div>
        )}
      </div>

      {/* Footer Settings */}
      <div style={styles.footer}>
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary"
          style={styles.settingsBtn}
        >
          <Settings size={16} />
          <span>Settings & API Key</span>
          {hasApiKey ? (
            <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 5px' }}>OK</span>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '9px', padding: '1px 5px' }}>ADD</span>
          )}
        </button>
        <div style={styles.credits}>
          <HelpCircle size={12} />
          <span>v1.0.0 • AI Digitizer</span>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '280px',
    height: 'calc(100vh - 24px)',
    position: 'sticky' as const,
    top: '12px',
    margin: '12px 0 12px 12px',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '16px',
    border: '1px solid var(--border-glass)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '-2px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  navBtn: {
    width: '100%',
    justifyContent: 'flex-start',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  navBtnActive: {
    color: 'var(--primary)',
    background: 'rgba(0, 242, 254, 0.08)',
    border: '1px solid rgba(0, 242, 254, 0.15)',
    fontWeight: 600,
  },
  optionsCard: {
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  toggleLabelContainer: {
    flex: 1,
  },
  toggleDesc: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    margin: '3px 0 0',
    lineHeight: '1.3',
  },
  switch: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '36px',
    height: '18px',
    cursor: 'pointer',
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: '34px',
    transition: '0.3s',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
  },
  sliderKnob: {
    height: '14px',
    width: '14px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: '0.3s',
    display: 'block',
  },
  exampleList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  exampleBtn: {
    width: '100%',
    textAlign: 'left' as const,
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  exampleInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
  },
  exampleMeta: {
    fontSize: '9px',
    color: 'var(--text-muted)',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  settingsBtn: {
    width: '100%',
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '10px 12px',
  },
  credits: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  historyEmpty: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    padding: '8px 12px',
    border: '1px dashed var(--border-glass)',
    borderRadius: '8px'
  },
  historyRowContainer: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  historyActions: {
    position: 'absolute' as const,
    right: '8px',
    display: 'flex',
    gap: '4px',
    zIndex: 10
  }
};
