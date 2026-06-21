import React, { useState } from 'react';
import { Table, Plus, Trash2, Edit, Check, X, FileText } from 'lucide-react';
import type { SeriesData } from '../utils/statistics';

interface DataPanelProps {
  dataSeries: SeriesData[];
  setDataSeries: React.Dispatch<React.SetStateAction<SeriesData[]>>;
}

export function DataPanel({ dataSeries, setDataSeries }: DataPanelProps) {
  const [selectedSeriesIdx, setSelectedSeriesIdx] = useState(0);
  const [editingSeriesName, setEditingSeriesName] = useState(false);
  const [seriesNameInput, setSeriesNameInput] = useState('');

  const activeSeries = dataSeries[selectedSeriesIdx] || null;

  const handleSeriesNameSave = () => {
    if (seriesNameInput.trim() && activeSeries) {
      const updated = [...dataSeries];
      updated[selectedSeriesIdx].name = seriesNameInput.trim();
      setDataSeries(updated);
      setEditingSeriesName(false);
    }
  };

  const startEditingSeriesName = () => {
    if (activeSeries) {
      setSeriesNameInput(activeSeries.name);
      setEditingSeriesName(true);
    }
  };

  const handleCellEdit = (pointIdx: number, field: 'x' | 'y', val: string) => {
    const updated = [...dataSeries];
    const series = updated[selectedSeriesIdx];
    if (!series) return;

    if (field === 'x') {
      // Allow writing string or number. If numeric, convert.
      const num = Number(val);
      series.data[pointIdx].x = !isNaN(num) && val.trim() !== '' ? num : val;
    } else {
      series.data[pointIdx].y = parseFloat(val) || 0;
    }
    setDataSeries(updated);
  };

  const addRow = () => {
    const updated = [...dataSeries];
    const series = updated[selectedSeriesIdx];
    if (!series) return;

    // Get last point values to suggest smart defaults
    let nextX: string | number = 0;
    let nextY = 0;

    if (series.data.length > 0) {
      const lastPt = series.data[series.data.length - 1];
      if (typeof lastPt.x === 'number') {
        nextX = lastPt.x + 1; // default step
      } else {
        nextX = lastPt.x + '_next';
      }
      nextY = lastPt.y;
    }

    series.data.push({ x: nextX, y: nextY });
    setDataSeries(updated);
  };

  const deleteRow = (pointIdx: number) => {
    const updated = [...dataSeries];
    const series = updated[selectedSeriesIdx];
    if (!series) return;

    series.data.splice(pointIdx, 1);
    setDataSeries(updated);
  };

  const deleteSeries = () => {
    if (dataSeries.length <= 1) {
      // Just clear data if it's the last series
      const updated = [...dataSeries];
      updated[0] = { name: 'Series 1', data: [] };
      setDataSeries(updated);
      return;
    }

    const updated = dataSeries.filter((_, idx) => idx !== selectedSeriesIdx);
    setDataSeries(updated);
    setSelectedSeriesIdx(Math.max(0, selectedSeriesIdx - 1));
  };

  return (
    <div className="glass-panel" style={styles.container}>
      {/* Header section with series picker and title */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table size={18} className="text-gradient" />
          <h3 style={{ fontSize: '16px' }}>Digitized Spreadsheet</h3>
        </div>

        {/* Series Selection and Rename */}
        <div style={styles.seriesControls}>
          {editingSeriesName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="text"
                value={seriesNameInput}
                onChange={(e) => setSeriesNameInput(e.target.value)}
                className="input-field"
                style={{ padding: '4px 8px', fontSize: '13px', width: '120px' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSeriesNameSave()}
              />
              <button onClick={handleSeriesNameSave} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <Check size={14} style={{ color: 'var(--accent-emerald)' }} />
              </button>
              <button onClick={() => setEditingSeriesName(false)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={14} style={{ color: 'var(--accent-rose)' }} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={selectedSeriesIdx}
                onChange={(e) => setSelectedSeriesIdx(parseInt(e.target.value))}
                className="input-field"
                style={{ padding: '4px 8px', fontSize: '13px' }}
              >
                {dataSeries.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button onClick={startEditingSeriesName} className="btn btn-ghost" style={{ padding: '4px' }} title="Rename Series">
                <Edit size={14} />
              </button>
            </div>
          )}

          <button onClick={deleteSeries} className="btn btn-danger btn-sm" style={{ fontSize: '12px' }}>
            Delete Series
          </button>
        </div>
      </div>

      {activeSeries ? (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={{ ...styles.th, width: '60px' }}>Row</th>
                <th style={styles.th}>X coordinate (Variable)</th>
                <th style={styles.th}>Y coordinate (Value)</th>
                <th style={{ ...styles.th, width: '60px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeSeries.data.length === 0 ? (
                <tr>
                  <td colSpan={4} style={styles.emptyCell}>
                    <FileText size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    No digitized points in this series. Use Manual Calibration to plot points or upload a graph image.
                  </td>
                </tr>
              ) : (
                activeSeries.data.map((point, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.rowIdxCell}>{idx + 1}</td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        value={point.x}
                        onChange={(e) => handleCellEdit(idx, 'x', e.target.value)}
                        className="mono cell-input"
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        step="any"
                        value={point.y}
                        onChange={(e) => handleCellEdit(idx, 'y', e.target.value)}
                        className="mono cell-input"
                      />
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        onClick={() => deleteRow(idx)}
                        style={styles.deleteRowBtn}
                        title="Delete Row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={styles.tableFooter}>
            <button onClick={addRow} className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
              <Plus size={14} /> Add Row
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Total Points: {activeSeries.data.length}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-center" style={{ minHeight: '200px', color: 'var(--text-secondary)' }}>
          No active series found. Add one in the calibration area.
        </div>
      )}
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
  seriesControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  thRow: {
    borderBottom: '2px solid var(--border-glass)',
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  tr: {
    borderBottom: '1px solid var(--border-glass)',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.01)',
    }
  },
  td: {
    padding: '6px 12px',
  },
  rowIdxCell: {
    padding: '6px 12px',
    color: 'var(--text-muted)',
    fontWeight: 500,
    textAlign: 'center' as const,
  },
  cellInput: {
    width: '100%',
    background: 'transparent',
    border: '1px solid transparent',
    color: '#fff',
    padding: '6px 8px',
    borderRadius: '4px',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: 'var(--primary)',
      background: 'rgba(0,0,0,0.2)',
    }
  },
  deleteRowBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      color: 'var(--accent-rose)',
      background: 'rgba(244,63,94,0.1)',
    }
  },
  emptyCell: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: 'var(--text-secondary)',
  },
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-glass)',
  }
};
