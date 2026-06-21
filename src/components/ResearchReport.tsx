import { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  Binary, 
  Calculator,
  Compass
} from 'lucide-react';
import { calculateSeriesStats } from '../utils/statistics';
import type { SeriesData, StatisticalSummary } from '../utils/statistics';

interface ResearchReportProps {
  dataSeries: SeriesData[];
  aiInsights?: {
    trend_analysis: string;
    statistical_summary?: {
      mean: number;
      growth_rate_pct: number | null;
      correlation_coefficient: number | null;
    };
    detected_insights: string[];
  };
}

export function ResearchReport({ dataSeries, aiInsights }: ResearchReportProps) {
  const [selectedSeriesIdx, setSelectedSeriesIdx] = useState(0);

  const activeSeries = dataSeries[selectedSeriesIdx] || null;
  const stats: StatisticalSummary | null = activeSeries ? calculateSeriesStats(activeSeries) : null;

  return (
    <div style={styles.container}>
      {/* Visual Header */}
      <div className="glass-panel" style={styles.summaryBanner}>
        <Sparkles size={24} className="text-gradient" />
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
            Research Intelligence Suite
          </h2>
          <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-secondary)' }}>
            Real-time statistical synthesis, regression curve models, and qualitative AI interpretations.
          </p>
        </div>
      </div>

      <div className="research-grid">
        {/* Left Column: Statistical Analysis */}
        <div className="glass-panel" style={styles.leftCol}>
          <div style={styles.header}>
            <Calculator size={18} className="text-gradient-green" />
            <h3 style={{ fontSize: '16px' }}>Statistical Summaries</h3>
            
            {dataSeries.length > 1 && (
              <select
                value={selectedSeriesIdx}
                onChange={(e) => setSelectedSeriesIdx(parseInt(e.target.value))}
                className="input-field"
                style={styles.select}
              >
                {dataSeries.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {stats ? (
            <div style={styles.statsLayout}>
              {/* Primary Metrics Grid */}
              <div style={styles.metricsGrid}>
                <div className="glass-panel" style={styles.metricCard}>
                  <span style={styles.metricLabel}>Arithmetic Mean</span>
                  <span style={styles.metricValue} className="mono">
                    {stats.mean.toFixed(2)}
                  </span>
                </div>

                <div className="glass-panel" style={styles.metricCard}>
                  <span style={styles.metricLabel}>Median Value</span>
                  <span style={styles.metricValue} className="mono">
                    {stats.median.toFixed(2)}
                  </span>
                </div>

                <div className="glass-panel" style={styles.metricCard}>
                  <span style={styles.metricLabel}>Std Deviation (σ)</span>
                  <span style={styles.metricValue} className="mono">
                    {stats.stdDev.toFixed(2)}
                  </span>
                </div>

                <div className="glass-panel" style={styles.metricCard}>
                  <span style={styles.metricLabel}>Range (Min / Max)</span>
                  <span style={{ ...styles.metricValue, fontSize: '15px' }} className="mono">
                    {stats.min.toFixed(1)} / {stats.max.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Advanced Indicators */}
              <div style={styles.advancedSec}>
                <h4 style={styles.subHeader}>Advanced Indicators</h4>

                <div style={styles.indicatorList}>
                  {stats.growthRate !== null && (
                    <div style={styles.indicatorRow}>
                      <span style={styles.indicatorLabel}>Net growth Rate</span>
                      <span
                        className="mono"
                        style={{
                          ...styles.indicatorVal,
                          color: stats.growthRate >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                        }}
                      >
                        {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(2)}%
                      </span>
                    </div>
                  )}

                  {stats.cagr !== null && (
                    <div style={styles.indicatorRow}>
                      <span style={styles.indicatorLabel}>Compound growth Rate (CAGR)</span>
                      <span
                        className="mono"
                        style={{
                          ...styles.indicatorVal,
                          color: stats.cagr >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                        }}
                      >
                        {stats.cagr >= 0 ? '+' : ''}{stats.cagr.toFixed(2)}% / year
                      </span>
                    </div>
                  )}

                  {stats.correlation !== null && (
                    <div style={styles.indicatorRow}>
                      <span style={styles.indicatorLabel}>Pearson Correlation (r)</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="mono" style={styles.indicatorVal}>
                          {stats.correlation.toFixed(3)}
                        </span>
                        <span
                          className="badge"
                          style={{
                            fontSize: '9px',
                            backgroundColor: Math.abs(stats.correlation) > 0.8 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                            color: Math.abs(stats.correlation) > 0.8 ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                          }}
                        >
                          {Math.abs(stats.correlation) > 0.8 ? 'Strong' : 'Weak'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Curve Fitting & Regression */}
              {stats.regression && (
                <div className="glass-panel" style={styles.regressionPanel}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Binary size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Linear Regression Model</span>
                  </div>
                  <div style={styles.formulaRow}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Best Fit Line:</span>
                    <code style={styles.formula} className="mono">
                      {stats.regression.equation}
                    </code>
                  </div>
                  <div style={styles.formulaRow}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coefficient of Determination (R²):</span>
                    <span className="mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                      {stats.regression.rSquare.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-center" style={{ minHeight: '200px', color: 'var(--text-muted)' }}>
              No series selected or points plotted.
            </div>
          )}
        </div>

        {/* Right Column: AI Research Narrative Insights */}
        <div className="glass-panel" style={styles.rightCol}>
          <div style={styles.header}>
            <TrendingUp size={18} className="text-gradient" />
            <h3 style={{ fontSize: '16px' }}>AI Interpretive Analysis</h3>
          </div>

          {aiInsights ? (
            <div style={styles.narrativeLayout}>
              <div style={styles.narrativeCard}>
                <h4 style={styles.narrativeTitle}>Trend Assessment</h4>
                <p style={styles.narrativeText}>{aiInsights.trend_analysis}</p>
              </div>

              <div style={styles.insightsSection}>
                <h4 style={styles.narrativeTitle}>Key Structural Observations</h4>
                <ul style={styles.insightList}>
                  {aiInsights.detected_insights.map((insight, idx) => (
                    <li key={idx} style={styles.insightItem}>
                      <ChevronRight size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {aiInsights.statistical_summary && (
                <div style={styles.aiVerificationCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Compass size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: 'var(--accent-emerald)' }}>
                      AI Calibrated Reference Summary
                    </span>
                  </div>
                  <div style={styles.aiVerificationGrid}>
                    <div>
                      <span style={styles.aiVerifyLabel}>AI Mean</span>
                      <span className="mono" style={styles.aiVerifyValue}>
                        {aiInsights.statistical_summary.mean.toFixed(2)}
                      </span>
                    </div>
                    {aiInsights.statistical_summary.growth_rate_pct !== null && (
                      <div>
                        <span style={styles.aiVerifyLabel}>AI Growth</span>
                        <span className="mono" style={styles.aiVerifyValue}>
                          {aiInsights.statistical_summary.growth_rate_pct.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {aiInsights.statistical_summary.correlation_coefficient !== null && (
                      <div>
                        <span style={styles.aiVerifyLabel}>AI Correlation</span>
                        <span className="mono" style={styles.aiVerifyValue}>
                          {aiInsights.statistical_summary.correlation_coefficient.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column' as const, gap: '12px' }}>
              <Sparkles size={32} style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13px', padding: '0 20px' }}>
                AI insights will appear here when you run extraction in <strong>Research Mode</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    width: '100%',
  },
  summaryBanner: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05), rgba(127, 0, 255, 0.05))',
    border: '1px solid rgba(0, 242, 254, 0.1)',
  },

  leftCol: {
    padding: '20px',
  },
  rightCol: {
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  select: {
    marginLeft: 'auto',
    padding: '4px 8px',
    fontSize: '12px',
  },
  statsLayout: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  metricCard: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  metricLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#fff',
  },
  advancedSec: {
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '16px',
  },
  subHeader: {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  indicatorList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  indicatorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  indicatorLabel: {
    color: 'var(--text-secondary)',
  },
  indicatorVal: {
    fontWeight: 600,
    color: '#fff',
  },
  regressionPanel: {
    padding: '12px',
    backgroundColor: 'rgba(0, 242, 254, 0.02)',
    border: '1px solid rgba(0, 242, 254, 0.1)',
  },
  formulaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    marginTop: '6px',
  },
  formula: {
    fontSize: '12px',
    color: 'var(--primary)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  narrativeLayout: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  narrativeCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  narrativeTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    borderLeft: '2px solid var(--primary)',
    paddingLeft: '8px',
  },
  narrativeText: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  insightsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  insightList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  insightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  aiVerificationCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '8px',
  },
  aiVerificationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  aiVerifyLabel: {
    display: 'block',
    fontSize: '9px',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: '2px',
  },
  aiVerifyValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
  }
};
