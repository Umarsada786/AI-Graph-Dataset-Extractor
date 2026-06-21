import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { FileUploader } from './components/FileUploader';
import { DataCalibration } from './components/DataCalibration';
import { DataPanel } from './components/DataPanel';
import { ChartPreview } from './components/ChartPreview';
import { ResearchReport } from './components/ResearchReport';
import { JSONViewer } from './components/JSONViewer';
import { useGemini } from './hooks/useGemini';
import { generateExampleImage, type ExampleGraph } from './utils/examples';
import { formatToCSV, type SeriesData } from './utils/statistics';
import { 
  Cpu, 
  Play, 
  RefreshCw, 
  Database,
  AlertCircle,
  Download,
  ArrowLeft
} from 'lucide-react';

export interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: string;
  graphType: string;
  imageSrc: string;
  dataSeries: SeriesData[];
  axes: { x_axis: string; y_axis: string };
  confidence: number;
  assumptions: string[];
  rawOutputResult: any;
}

function App() {
  // Configurations
  const [apiKey, setApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('extractor'); // 'extractor' | 'calibration'
  const [researchMode, setResearchMode] = useState(false);

  // Loaded document/graph state
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [currentExampleId, setCurrentExampleId] = useState<string | null>(null);

  // Extracted Data States
  const [dataSeries, setDataSeries] = useState<SeriesData[]>([]);
  const [axes, setAxes] = useState({ x_axis: 'X', y_axis: 'Y' });
  const [confidence, setConfidence] = useState<number | null>(null);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [rawOutputResult, setRawOutputResult] = useState<any>(null);

  // Sub-tabs in result view: 'spreadsheet' | 'chart' | 'research' | 'export'
  const [activeResultTab, setActiveResultTab] = useState<'spreadsheet' | 'chart' | 'research' | 'export'>('spreadsheet');

  // Gemini API Hook
  const { loading, error, extractGraphData, setError } = useGemini();
  const [isSimulating, setIsSimulating] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('extraction_history');
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  const addToHistory = (
    fileName: string,
    imgSrc: string,
    seriesList: SeriesData[],
    axConfig: { x_axis: string; y_axis: string },
    conf: number,
    asms: string[],
    rawResult: any
  ) => {
    const type = rawResult?.graphs_detected?.[0]?.graph_type || 'line';
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      fileName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      graphType: type,
      imageSrc: imgSrc,
      dataSeries: seriesList,
      axes: axConfig,
      confidence: conf,
      assumptions: asms,
      rawOutputResult: rawResult
    };

    setHistoryList(prev => {
      // Avoid duplicate filenames in history stack
      const filtered = prev.filter(item => item.fileName !== fileName);
      const updated = [newItem, ...filtered].slice(0, 12);
      localStorage.setItem('extraction_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryList(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('extraction_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDownloadHistoryItem = (item: HistoryItem, format: 'csv' | 'excel') => {
    if (item.dataSeries.length === 0) return;
    const csvContent = formatToCSV(item.dataSeries);
    const contentWithBOM = format === 'excel' ? "\uFEFF" + csvContent : csvContent;
    const blob = new Blob([contentWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digitized_data_${item.fileName.replace(/\.[^/.]+$/, "") || 'result'}.${format === 'excel' ? 'excel.csv' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem('extraction_history');
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setDataSeries(item.dataSeries);
    setAxes(item.axes);
    setConfidence(item.confidence);
    setAssumptions(item.assumptions);
    setRawOutputResult(item.rawOutputResult);
    setUploadedImageSrc(item.imageSrc);
    setCurrentFileName(item.fileName);
    setCurrentExampleId(null);
    setActiveTab('extractor');
    setActiveResultTab('spreadsheet');
    setError(null);
  };

  // Load API Key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleClearFile = () => {
    setCurrentFileName(null);
    setUploadedImageSrc(null);
    setCurrentExampleId(null);
    setDataSeries([]);
    setAxes({ x_axis: 'X', y_axis: 'Y' });
    setConfidence(null);
    setAssumptions([]);
    setRawOutputResult(null);
    setError(null);
  };

  const handleLoadExample = (ex: ExampleGraph) => {
    handleClearFile();
    setCurrentFileName(ex.title);
    setCurrentExampleId(ex.id);
    
    // Generate image dynamically using examples drawer
    const demoImg = generateExampleImage(ex.id);
    setUploadedImageSrc(demoImg);

    // Populate data states
    setDataSeries(ex.data_series);
    setAxes(ex.axes);
    setConfidence(ex.confidence);
    setAssumptions(ex.assumptions);
    
    // Structure mock raw result
    const mockResult = {
      graphs_detected: [
        {
          graph_type: ex.graph_type,
          title: ex.title,
          axes: ex.axes,
          data_series: ex.data_series,
          confidence: ex.confidence,
          assumptions: ex.assumptions,
          research_insights: ex.research_insights ? {
            trend_analysis: ex.research_insights.narrative,
            statistical_summary: {
              mean: ex.data_series[0].data.reduce((acc, d) => acc + d.y, 0) / ex.data_series[0].data.length,
              growth_rate_pct: ex.id === 'global-temp' ? 40 : null,
              correlation_coefficient: ex.id === 'drug-dosage' ? -0.98 : null
            },
            detected_insights: ex.research_insights.key_takeaways
          } : undefined
        }
      ]
    };
    
    // Resolve research insights
    if (ex.research_insights) {
      mockResult.graphs_detected[0].research_insights = {
        trend_analysis: ex.research_insights.narrative,
        statistical_summary: {
          mean: ex.data_series[0].data.reduce((acc: number, d) => acc + d.y, 0) / ex.data_series[0].data.length,
          growth_rate_pct: ex.id === 'global-temp' ? 40 : null,
          correlation_coefficient: ex.id === 'drug-dosage' ? -0.98 : null
        },
        detected_insights: ex.research_insights.key_takeaways
      };
    }

    setRawOutputResult(mockResult);
    setActiveTab('extractor');
    setActiveResultTab('spreadsheet');
  };

  const handleImageUploaded = (dataUrl: string, name: string) => {
    handleClearFile();
    setCurrentFileName(name);
    setUploadedImageSrc(dataUrl);
    setActiveTab('extractor');
  };

  const triggerAIExtraction = async () => {
    if (!uploadedImageSrc) return;
    setError(null);

    if (!apiKey) {
      // Simulate extraction fallback!
      setIsSimulating(true);
      
      // Wait 1.5 seconds to feel like the AI is working
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const name = currentFileName || 'uploaded_graph.png';
      const isBar = /sales|revenue|bar|quarter|category/i.test(name);
      const isScatter = /scatter|dispersion|trial|dosage/i.test(name);
      
      const type = isBar ? 'bar' : isScatter ? 'scatter' : 'line';
      const title = `Digitized: ${name.replace(/\.[^/.]+$/, "")}`;
      const xAxis = isBar ? 'Category' : 'X-Axis';
      const yAxis = 'Calibrated Value';
      
      let seriesData: { x: string | number; y: number }[] = [];
      if (isBar) {
        seriesData = [
          { x: 'Enterprise', y: Math.floor(Math.random() * 200) + 300 },
          { x: 'Mid-Market', y: Math.floor(Math.random() * 150) + 150 },
          { x: 'SMB', y: Math.floor(Math.random() * 100) + 80 },
          { x: 'Consumer', y: Math.floor(Math.random() * 50) + 40 }
        ];
      } else if (isScatter) {
        seriesData = Array.from({ length: 8 }).map((_, i) => ({
          x: (i + 1) * 10,
          y: Math.floor(100 - (i + 1) * 8 + Math.random() * 10)
        }));
      } else {
        // Line chart default
        seriesData = Array.from({ length: 9 }).map((_, i) => ({
          x: 2015 + i,
          y: Math.floor(50 + i * 15 + Math.random() * 20)
        }));
      }

      const mockResult = {
        graphs_detected: [
          {
            graph_type: type,
            title: title,
            axes: { x_axis: xAxis, y_axis: yAxis },
            data_series: [{ name: 'Extracted Series 1', data: seriesData }],
            confidence: 0.88,
            assumptions: [
              'Simulated mapping due to missing Gemini API key.',
              'X and Y axis scales inferred linearly.',
              'Data points smoothed dynamically based on relative pixels.'
            ],
            research_insights: researchMode ? {
              trend_analysis: `The simulated dataset demonstrates a clear ${type === 'scatter' ? 'negative' : 'positive'} trend pattern. The linear model shows high predictability with small residual variances.`,
              statistical_summary: {
                mean: seriesData.reduce((acc, d) => acc + d.y, 0) / seriesData.length,
                growth_rate_pct: type === 'line' ? 120 : null,
                correlation_coefficient: type === 'scatter' ? -0.96 : 0.94
              },
              detected_insights: [
                'Significant linear correlation observed across simulated endpoints.',
                'Local variations smoothed to ensure stable data visualization.',
                'Add a Gemini API Key in settings to execute real vision OCR extraction.'
              ]
            } : undefined
          }
        ]
      };

      setDataSeries(mockResult.graphs_detected[0].data_series);
      setAxes(mockResult.graphs_detected[0].axes);
      setConfidence(0.88);
      setAssumptions(mockResult.graphs_detected[0].assumptions);
      setRawOutputResult(mockResult);
      setIsSimulating(false);
      setActiveResultTab('spreadsheet');
      addToHistory(name, uploadedImageSrc, mockResult.graphs_detected[0].data_series, mockResult.graphs_detected[0].axes, 0.88, mockResult.graphs_detected[0].assumptions, mockResult);
      
      // Let the user know we simulated
      setError('⚡ Demo Simulation Active: No API key found. Enter a Gemini Key in Settings to run real vision extraction.');
      return;
    }

    const result = await extractGraphData(uploadedImageSrc, researchMode, apiKey);
    
    if (result && result.graphs_detected && result.graphs_detected.length > 0) {
      const graph = result.graphs_detected[0];
      setDataSeries(graph.data_series || []);
      setAxes(graph.axes || { x_axis: 'X', y_axis: 'Y' });
      setConfidence(graph.confidence || 0.8);
      setAssumptions(graph.assumptions || []);
      setRawOutputResult(result);
      addToHistory(currentFileName || 'extracted_graph.png', uploadedImageSrc, graph.data_series || [], graph.axes || { x_axis: 'X', y_axis: 'Y' }, graph.confidence || 0.8, graph.assumptions || [], result);
      
      // Auto switch result tab
      setActiveResultTab('spreadsheet');
    }
  };

  const downloadDatasetFile = (format: 'csv' | 'excel') => {
    if (dataSeries.length === 0) return;
    const csvContent = formatToCSV(dataSeries);
    const contentWithBOM = format === 'excel' ? "\uFEFF" + csvContent : csvContent;
    const blob = new Blob([contentWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digitized_data_${currentFileName?.replace(/\.[^/.]+$/, "") || 'result'}.${format === 'excel' ? 'excel.csv' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Determine graph type format
  const activeGraphType = rawOutputResult?.graphs_detected?.[0]?.graph_type || 'line';

  return (
    <div style={styles.appWrapper}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        researchMode={researchMode}
        setResearchMode={setResearchMode}
        onOpenSettings={() => setSettingsOpen(true)}
        hasApiKey={!!apiKey}
        onLoadExample={handleLoadExample}
        currentExampleId={currentExampleId}
        historyList={historyList}
        onLoadHistory={handleLoadHistory}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onDownloadHistoryItem={handleDownloadHistoryItem}
      />

      {/* Main Workspace Frame */}
      <main style={styles.mainContent}>
        {/* Workspace Top Header bar */}
        <header className="glass-panel" style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeTab === 'calibration' ? 'Manual Calibration Workbench' : 'AI Multimodal Extraction Workspace'}
            </h1>
            <p style={styles.pageDesc}>
              {activeTab === 'calibration'
                ? 'Place visual reference points and manually digitize custom data directly from graph images.'
                : 'Convert complex visual representations of charts and PDFs into clean tabular models instantly.'}
            </p>
          </div>

          <div style={styles.headerStatus}>
            {uploadedImageSrc && (
              <button
                onClick={handleClearFile}
                className="btn btn-secondary btn-sm pulse-primary animate-fade-in"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600 }}
                title="Go back to file upload screen"
              >
                <ArrowLeft size={13} />
                <span>Go Back</span>
              </button>
            )}
            <button 
              onClick={() => setSettingsOpen(true)} 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Cpu size={12} style={{ color: apiKey ? 'var(--accent-emerald)' : 'var(--text-secondary)' }} />
              <span>{apiKey ? 'Gemini API Connected' : 'Demo Simulator Active'}</span>
            </button>
          </div>
        </header>

        {/* Workspace Display */}
        <div style={styles.workspaceBody}>
          {activeTab === 'calibration' ? (
            <DataCalibration
              imageSrc={uploadedImageSrc}
              dataSeries={dataSeries}
              setDataSeries={setDataSeries}
              axes={axes}
              setAxes={setAxes}
            />
          ) : (
            // Extractor view
            <div style={styles.extractorView}>
              {!uploadedImageSrc ? (
                <div style={{ maxWidth: '640px', margin: '40px auto 0', width: '100%' }}>
                  <FileUploader
                    onImageSelected={handleImageUploaded}
                    onClear={handleClearFile}
                    currentFileName={currentFileName}
                    loading={loading}
                  />
                </div>
              ) : (
                // Split Screen Workspace
                <div className="dashboard-split">
                  {/* Left Workspace Panel: Original visual & controls */}
                  <div className="glass-panel" style={styles.visualPanel}>
                    <div style={styles.panelHeader}>
                      <button 
                        onClick={handleClearFile} 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px', width: '24px', borderRadius: '4px' }}
                        title="Go back to upload screen"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <Database size={14} className="text-gradient" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>Source Graph Visual</span>
                      {currentFileName && (
                        <span style={styles.fileNameBadge} title={currentFileName}>
                          {currentFileName.length > 25 ? currentFileName.substring(0, 22) + '...' : currentFileName}
                        </span>
                      )}
                    </div>

                    <div style={styles.imageViewer}>
                      <img src={uploadedImageSrc} alt="Source Data" style={styles.sourceImg} />
                    </div>

                    {/* Controls Bar */}
                    <div style={styles.controlsBar}>
                      <button
                        onClick={triggerAIExtraction}
                        disabled={loading || isSimulating}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        {(loading || isSimulating) ? (
                          <>
                            <RefreshCw size={16} className="spinner" style={{ animation: 'spin 1.5s linear infinite' }} />
                            <span>{isSimulating ? 'Simulating...' : 'AI Digitizing...'}</span>
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            <span>Extract Dataset with AI</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab('calibration')}
                        className="btn btn-secondary"
                        title="Calibrate coordinates manually"
                      >
                        Manual Calibration
                      </button>

                      <button
                        onClick={handleClearFile}
                        className="btn btn-danger"
                      >
                        Change File
                      </button>
                    </div>

                    {error && (
                      <div 
                        className="glass-panel animate-fade-in" 
                        style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid',
                          borderRadius: '8px',
                          borderColor: error.startsWith('⚡') ? 'rgba(0, 242, 254, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          backgroundColor: error.startsWith('⚡') ? 'rgba(0, 242, 254, 0.03)' : 'rgba(244, 63, 94, 0.03)',
                          color: error.startsWith('⚡') ? 'var(--primary)' : 'var(--accent-rose)'
                        }}
                      >
                        <AlertCircle size={16} style={{ marginRight: '8px', flexShrink: 0, color: error.startsWith('⚡') ? 'var(--primary)' : 'var(--accent-rose)' }} />
                        <span style={{ fontSize: '12px' }}>{error}</span>
                      </div>
                    )}

                    {dataSeries.length > 0 && (
                      <div className="glass-panel animate-fade-in" style={{ marginTop: '12px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Direct Export Options:
                        </span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            onClick={() => downloadDatasetFile('csv')}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, gap: '6px' }}
                          >
                            <Download size={13} />
                            <span>Download CSV</span>
                          </button>
                          <button
                            onClick={() => downloadDatasetFile('excel')}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, gap: '6px' }}
                          >
                            <Download size={13} />
                            <span>Download Excel (CSV)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confidence & Assumptions if loaded */}
                    {confidence !== null && (
                      <div style={styles.aiMetaCard}>
                        <div style={styles.aiMetaHeader}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Extraction Confidence: <strong>{(confidence * 100).toFixed(0)}%</strong>
                          </span>
                          <span
                            className="badge"
                            style={{
                              fontSize: '9px',
                              backgroundColor: confidence > 0.9 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                              color: confidence > 0.9 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                            }}
                          >
                            {confidence > 0.9 ? 'High Quality' : 'Moderate Quality'}
                          </span>
                        </div>
                        {assumptions.length > 0 && (
                          <div style={styles.assumptionsSection}>
                            <span style={styles.metaLabel}>Applied AI Assumptions:</span>
                            <ul style={styles.metaList}>
                              {assumptions.map((asm, i) => (
                                <li key={i}>{asm}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Workspace Panel: Results display */}
                  <div style={styles.resultsPanel}>
                    {/* Panel selection sub-tabs */}
                    <div className="glass-panel" style={styles.resultsTabbar}>
                      <button
                        onClick={() => setActiveResultTab('spreadsheet')}
                        style={{
                          ...styles.subtab,
                          color: activeResultTab === 'spreadsheet' ? 'var(--primary)' : 'var(--text-secondary)',
                          borderBottomColor: activeResultTab === 'spreadsheet' ? 'var(--primary)' : 'transparent'
                        }}
                      >
                        Spreadsheet
                      </button>
                      <button
                        onClick={() => setActiveResultTab('chart')}
                        style={{
                          ...styles.subtab,
                          color: activeResultTab === 'chart' ? 'var(--primary)' : 'var(--text-secondary)',
                          borderBottomColor: activeResultTab === 'chart' ? 'var(--primary)' : 'transparent'
                        }}
                      >
                        Visual Verification
                      </button>
                      
                      {researchMode && (
                        <button
                          onClick={() => setActiveResultTab('research')}
                          style={{
                            ...styles.subtab,
                            color: activeResultTab === 'research' ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottomColor: activeResultTab === 'research' ? 'var(--primary)' : 'transparent'
                          }}
                        >
                          Research Analysis
                        </button>
                      )}

                      <button
                        onClick={() => setActiveResultTab('export')}
                        style={{
                          ...styles.subtab,
                          color: activeResultTab === 'export' ? 'var(--primary)' : 'var(--text-secondary)',
                          borderBottomColor: activeResultTab === 'export' ? 'var(--primary)' : 'transparent'
                        }}
                      >
                        Export Hub
                      </button>
                    </div>

                    {/* Result Content container */}
                    <div style={styles.resultsContent}>
                      {activeResultTab === 'spreadsheet' && (
                        <DataPanel dataSeries={dataSeries} setDataSeries={setDataSeries} />
                      )}

                      {activeResultTab === 'chart' && (
                        <ChartPreview dataSeries={dataSeries} axes={axes} defaultGraphType={activeGraphType} />
                      )}

                      {activeResultTab === 'research' && researchMode && (
                        <ResearchReport 
                          dataSeries={dataSeries} 
                          aiInsights={rawOutputResult?.graphs_detected?.[0]?.research_insights}
                        />
                      )}

                      {activeResultTab === 'export' && (
                        <JSONViewer rawData={rawOutputResult || {}} dataSeries={dataSeries} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Global API Settings Modal */}
      <ApiKeyModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
    </div>
  );
}

const styles = {
  appWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-darker)',
  },
  mainContent: {
    flex: 1,
    padding: '12px 12px 12px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    height: '100vh',
    overflowY: 'auto' as const,
  },
  topbar: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  pageDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '3px 0 0',
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  workspaceBody: {
    flex: 1,
    width: '100%',
  },
  extractorView: {
    width: '100%',
  },

  visualPanel: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '10px',
  },
  fileNameBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-secondary)',
    marginLeft: 'auto',
  },
  imageViewer: {
    width: '100%',
    backgroundColor: '#030712',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '260px',
  },
  sourceImg: {
    maxWidth: '100%',
    maxHeight: '380px',
    objectFit: 'contain' as const,
    borderRadius: '4px',
  },
  controlsBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  aiMetaCard: {
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '12px',
    marginTop: '4px',
  },
  aiMetaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  assumptionsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  metaLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  metaList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  resultsPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  resultsTabbar: {
    display: 'flex',
    gap: '16px',
    padding: '8px 16px',
  },
  subtab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '6px 4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  resultsContent: {
    width: '100%',
  }
};

export default App;
