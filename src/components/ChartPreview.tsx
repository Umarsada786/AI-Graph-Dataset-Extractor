import { useState } from 'react';
import { AreaChart as LucideAreaChart, TrendingUp, BarChart2, Eye, CircleDot } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import type { SeriesData } from '../utils/statistics';

interface ChartPreviewProps {
  dataSeries: SeriesData[];
  axes: { x_axis: string; y_axis: string };
  defaultGraphType?: 'line' | 'bar' | 'scatter' | 'pie' | 'unknown';
}

export function ChartPreview({
  dataSeries,
  axes,
  defaultGraphType = 'line'
}: ChartPreviewProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'scatter'>(
    defaultGraphType === 'bar' ? 'bar' : 
    defaultGraphType === 'scatter' ? 'scatter' : 'line'
  );

  // Transform data series to Recharts format: array of { name: x, [series1Name]: y1, [series2Name]: y2 }
  const getChartData = () => {
    const allX = new Set<string | number>();
    dataSeries.forEach((s) => s.data.forEach((d) => allX.add(d.x)));

    // Sort X values
    const sortedX = Array.from(allX).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return String(a).localeCompare(String(b));
    });

    return sortedX.map((xVal) => {
      const row: any = { name: xVal };
      dataSeries.forEach((s) => {
        const pt = s.data.find((d) => d.x === xVal);
        if (pt !== undefined) {
          row[s.name] = pt.y;
        }
      });
      return row;
    });
  };

  const chartData = getChartData();
  const seriesNames = dataSeries.map((s) => s.name);
  const colors = ['#00f2fe', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={styles.tooltip}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {axes.x_axis}: <strong style={{ color: '#fff' }}>{label}</strong>
          </span>
          <div style={styles.tooltipList}>
            {payload.map((entry: any, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: entry.color || entry.fill
                  }}
                />
                <span style={{ fontSize: '12px' }}>
                  {entry.name}: <strong>{entry.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex-center" style={{ flex: 1, height: '300px', flexDirection: 'column' as const }}>
          <CircleDot size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No digitized data to plot yet.</span>
        </div>
      );
    }

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                {colors.map((color, idx) => (
                  <linearGradient key={idx} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {seriesNames.map((name, idx) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[idx % colors.length]}
                  fill={`url(#grad-${idx % colors.length})`}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {seriesNames.map((name, idx) => (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        // For scatter plots, X values should be parsed as numbers
        const scatterData = chartData.map((d) => ({
          ...d,
          name: Number(d.name)
        }));

        return (
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="name"
                name={axes.x_axis}
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                type="number"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {seriesNames.map((name, idx) => (
                <Scatter
                  key={name}
                  name={name}
                  data={scatterData}
                  fill={colors[idx % colors.length]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {seriesNames.map((name, idx) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 1.5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={18} className="text-gradient" />
          <h3 style={{ fontSize: '16px' }}>Interactive Chart Verification</h3>
        </div>

        {/* Chart selectors */}
        <div style={styles.chartTypes}>
          <button
            onClick={() => setChartType('line')}
            className={`btn btn-secondary btn-sm ${chartType === 'line' ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              backgroundColor: chartType === 'line' ? 'var(--primary-glow)' : 'transparent',
              borderColor: chartType === 'line' ? 'var(--primary)' : 'var(--border-glass)',
              color: chartType === 'line' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <Eye size={13} />
            <span>Line</span>
          </button>

          <button
            onClick={() => setChartType('area')}
            className={`btn btn-secondary btn-sm ${chartType === 'area' ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              backgroundColor: chartType === 'area' ? 'var(--primary-glow)' : 'transparent',
              borderColor: chartType === 'area' ? 'var(--primary)' : 'var(--border-glass)',
              color: chartType === 'area' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <LucideAreaChart size={13} />
            <span>Area</span>
          </button>

          <button
            onClick={() => setChartType('bar')}
            className={`btn btn-secondary btn-sm ${chartType === 'bar' ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              backgroundColor: chartType === 'bar' ? 'var(--primary-glow)' : 'transparent',
              borderColor: chartType === 'bar' ? 'var(--primary)' : 'var(--border-glass)',
              color: chartType === 'bar' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <BarChart2 size={13} />
            <span>Bar</span>
          </button>

          <button
            onClick={() => setChartType('scatter')}
            className={`btn btn-secondary btn-sm ${chartType === 'scatter' ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              backgroundColor: chartType === 'scatter' ? 'var(--primary-glow)' : 'transparent',
              borderColor: chartType === 'scatter' ? 'var(--primary)' : 'var(--border-glass)',
              color: chartType === 'scatter' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <TrendingUp size={13} />
            <span>Scatter</span>
          </button>
        </div>
      </div>

      <div style={styles.chartWrapper}>{renderChart()}</div>
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
  chartTypes: {
    display: 'flex',
    gap: '8px',
  },
  chartWrapper: {
    width: '100%',
    minHeight: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    padding: '10px 12px',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    boxShadow: 'var(--shadow-md)',
  },
  tooltipList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    marginTop: '6px',
  }
};
