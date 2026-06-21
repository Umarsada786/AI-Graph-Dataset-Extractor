import React, { useState, useRef, useEffect } from 'react';
import { 
  Crosshair, 
  MapPin, 
  Plus, 
  Trash2, 
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  ListPlus
} from 'lucide-react';
import type { SeriesData } from '../utils/statistics';

interface DataCalibrationProps {
  imageSrc: string | null;
  dataSeries: SeriesData[];
  setDataSeries: React.Dispatch<React.SetStateAction<SeriesData[]>>;
  axes: { x_axis: string; y_axis: string };
  setAxes: React.Dispatch<React.SetStateAction<{ x_axis: string; y_axis: string }>>;
}

interface PixelPoint {
  x: number; // pixel offset X
  y: number; // pixel offset Y
}

interface CalibrationRef {
  pixel: PixelPoint | null;
  value: number;
}

export function DataCalibration({
  imageSrc,
  dataSeries,
  setDataSeries,
  axes: _axes,
  setAxes: _setAxes
}: DataCalibrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Calibration points in pixels & values
  const [refOrigin, setRefOrigin] = useState<CalibrationRef>({ pixel: null, value: 0 });
  const [refXMax, setRefXMax] = useState<CalibrationRef>({ pixel: null, value: 100 });
  const [refYMax, setRefYMax] = useState<CalibrationRef>({ pixel: null, value: 100 });
  
  // Custom input states for reference values
  const [originValInput, setOriginValInput] = useState('0');
  const [xMaxValInput, setXMaxValInput] = useState('100');
  const [yMaxValInput, setYMaxValInput] = useState('100');

  // Interactive modes: 'origin' | 'xmax' | 'ymax' | 'add_point' | 'idle'
  const [activeMode, setActiveMode] = useState<'origin' | 'xmax' | 'ymax' | 'add_point' | 'idle'>('idle');
  const [selectedSeriesIdx, setSelectedSeriesIdx] = useState(0);

  // Dimensions of rendered image
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });

  // Update input text when states change
  useEffect(() => {
    setRefOrigin(r => ({ ...r, value: parseFloat(originValInput) || 0 }));
  }, [originValInput]);

  useEffect(() => {
    setRefXMax(r => ({ ...r, value: parseFloat(xMaxValInput) || 100 }));
  }, [xMaxValInput]);

  useEffect(() => {
    setRefYMax(r => ({ ...r, value: parseFloat(yMaxValInput) || 100 }));
  }, [yMaxValInput]);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgDims({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight
      });
    }
  };

  // Resize listener to adjust overlays if window resizes
  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        setImgDims({
          width: imgRef.current.clientWidth,
          height: imgRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageSrc) return;
    
    // Get mouse position relative to image
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const clickedPixel: PixelPoint = { x: px, y: py };

    if (activeMode === 'origin') {
      setRefOrigin(prev => ({ ...prev, pixel: clickedPixel }));
      setActiveMode('idle');
    } else if (activeMode === 'xmax') {
      setRefXMax(prev => ({ ...prev, pixel: clickedPixel }));
      setActiveMode('idle');
    } else if (activeMode === 'ymax') {
      setRefYMax(prev => ({ ...prev, pixel: clickedPixel }));
      setActiveMode('idle');
    } else if (activeMode === 'add_point') {
      if (isCalibrated()) {
        const mathCoords = pixelToMath(clickedPixel);
        if (mathCoords) {
          // Add point to active series
          const updatedSeries = [...dataSeries];
          if (updatedSeries.length === 0) {
            updatedSeries.push({ name: 'Series 1', data: [] });
          }
          const activeSeries = updatedSeries[selectedSeriesIdx] || updatedSeries[0];
          
          // Determine X type (if numeric or string)
          const newX = mathCoords.x;
          
          activeSeries.data.push({ x: Number(newX.toFixed(2)), y: Number(mathCoords.y.toFixed(2)) });
          // Sort data by X if X is numeric
          activeSeries.data.sort((a, b) => Number(a.x) - Number(b.x));
          setDataSeries(updatedSeries);
        }
      }
    }
  };

  const isCalibrated = (): boolean => {
    return refOrigin.pixel !== null && refXMax.pixel !== null && refYMax.pixel !== null;
  };

  /**
   * Convert pixels -> math coordinates based on calibration points
   */
  const pixelToMath = (pixel: PixelPoint): { x: number; y: number } | null => {
    const o = refOrigin.pixel;
    const xm = refXMax.pixel;
    const ym = refYMax.pixel;

    if (!o || !xm || !ym) return null;

    // Linear scale translation
    // Scale X is based on difference between Origin.x and XMax.x
    const dxPx = xm.x - o.x;
    // Scale Y is based on difference between Origin.y and YMax.y
    const dyPx = ym.y - o.y;

    if (dxPx === 0 || dyPx === 0) return null;

    const dxVal = refXMax.value - refOrigin.value;
    const dyVal = refYMax.value - refOrigin.value;

    const scaleX = dxVal / dxPx;
    const scaleY = dyVal / dyPx;

    const mathX = refOrigin.value + (pixel.x - o.x) * scaleX;
    const mathY = refOrigin.value + (pixel.y - o.y) * scaleY;

    return { x: mathX, y: mathY };
  };

  /**
   * Convert math coordinates -> pixel points (for overlaying dots)
   */
  const mathToPixel = (mathX: number, mathY: number): PixelPoint | null => {
    const o = refOrigin.pixel;
    const xm = refXMax.pixel;
    const ym = refYMax.pixel;

    if (!o || !xm || !ym) return null;

    const dxVal = refXMax.value - refOrigin.value;
    const dyVal = refYMax.value - refOrigin.value;

    if (dxVal === 0 || dyVal === 0) return null;

    const scaleX = (xm.x - o.x) / dxVal;
    const scaleY = (ym.y - o.y) / dyVal;

    const px = o.x + (mathX - refOrigin.value) * scaleX;
    const py = o.y + (mathY - refOrigin.value) * scaleY;

    return { x: px, y: py };
  };

  const removePoint = (seriesIdx: number, pointIdx: number) => {
    const updated = [...dataSeries];
    updated[seriesIdx].data.splice(pointIdx, 1);
    setDataSeries(updated);
  };

  const clearCalibration = () => {
    setRefOrigin({ pixel: null, value: 0 });
    setRefXMax({ pixel: null, value: 100 });
    setRefYMax({ pixel: null, value: 100 });
    setOriginValInput('0');
    setXMaxValInput('100');
    setYMaxValInput('100');
    setActiveMode('idle');
  };

  const addEmptySeries = () => {
    const newName = `Series ${dataSeries.length + 1}`;
    setDataSeries([...dataSeries, { name: newName, data: [] }]);
    setSelectedSeriesIdx(dataSeries.length);
  };

  return (
    <div style={styles.grid}>
      {/* Visual Workspace Panel */}
      <div className="glass-panel" style={styles.workspace}>
        <div style={styles.panelHeader}>
          <Crosshair size={18} className="text-gradient" />
          <h3 style={{ fontSize: '16px' }}>Visual Calibration Area</h3>
        </div>

        {imageSrc ? (
          <div style={styles.canvasContainer} ref={containerRef}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Calibration Workspace"
                onLoad={handleImageLoad}
                onClick={handleImageClick}
                style={{
                  ...styles.workspaceImg,
                  cursor: activeMode !== 'idle' ? 'crosshair' : 'default'
                }}
              />
              
              {/* Reference Calibration Markers Overlays */}
              {refOrigin.pixel && (
                <div
                  style={{
                    ...styles.refMarker,
                    left: `${refOrigin.pixel.x}px`,
                    top: `${refOrigin.pixel.y}px`,
                    backgroundColor: '#10b981'
                  }}
                  title="Origin Calibration Point"
                >
                  <MapPin size={12} style={{ color: '#060913' }} />
                  <span style={styles.markerText}>O ({refOrigin.value})</span>
                </div>
              )}

              {refXMax.pixel && (
                <div
                  style={{
                    ...styles.refMarker,
                    left: `${refXMax.pixel.x}px`,
                    top: `${refXMax.pixel.y}px`,
                    backgroundColor: '#00f2fe'
                  }}
                  title="X-Max Calibration Point"
                >
                  <MapPin size={12} style={{ color: '#060913' }} />
                  <span style={styles.markerText}>X ({refXMax.value})</span>
                </div>
              )}

              {refYMax.pixel && (
                <div
                  style={{
                    ...styles.refMarker,
                    left: `${refYMax.pixel.x}px`,
                    top: `${refYMax.pixel.y}px`,
                    backgroundColor: '#a855f7'
                  }}
                  title="Y-Max Calibration Point"
                >
                  <MapPin size={12} style={{ color: '#060913' }} />
                  <span style={styles.markerText}>Y ({refYMax.value})</span>
                </div>
              )}

              {/* Plotted Digitized Data Points Overlays */}
              {isCalibrated() && dataSeries.map((series, sIdx) => {
                const isSelectedSeries = sIdx === selectedSeriesIdx;
                return series.data.map((pt, pIdx) => {
                  const pxPoint = mathToPixel(Number(pt.x), pt.y);
                  if (!pxPoint) return null;

                  // Skip drawing points that fall outside the image borders
                  if (pxPoint.x < 0 || pxPoint.x > imgDims.width || pxPoint.y < 0 || pxPoint.y > imgDims.height) {
                    return null;
                  }

                  return (
                    <div
                      key={`${sIdx}-${pIdx}`}
                      style={{
                        ...styles.dataDot,
                        left: `${pxPoint.x}px`,
                        top: `${pxPoint.y}px`,
                        backgroundColor: isSelectedSeries ? '#ef4444' : 'rgba(255, 255, 255, 0.4)',
                        border: isSelectedSeries ? '1.5px solid #fff' : '1px solid rgba(0,0,0,0.5)',
                        zIndex: isSelectedSeries ? 10 : 5
                      }}
                      title={`${series.name}: (${pt.x}, ${pt.y})`}
                    >
                      {isSelectedSeries && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePoint(sIdx, pIdx);
                          }}
                          style={styles.dotRemoveBtn}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        ) : (
          <div className="flex-center" style={{ flex: 1, minHeight: '300px', flexDirection: 'column' as const, gap: '12px' }}>
            <HelpCircle size={40} style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>
              Please upload a graph image or select an example in the Workspace first.
            </p>
          </div>
        )}
      </div>

      {/* Control Configuration Panel */}
      <div className="glass-panel" style={styles.controls}>
        <div style={styles.panelHeader}>
          <MapPin size={18} className="text-gradient" />
          <h3 style={{ fontSize: '16px' }}>Calibration Calibration</h3>
        </div>

        {/* Step 1: Set Reference Points */}
        <div style={styles.configSection}>
          <div style={styles.configHeader}>
            <span style={styles.stepBadge}>1</span>
            <span style={styles.stepTitle}>Configure Calibration Values</span>
          </div>

          <div style={styles.inputGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Origin value</label>
              <input
                type="number"
                value={originValInput}
                onChange={(e) => setOriginValInput(e.target.value)}
                className="input-field"
                style={styles.smallInput}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>X-Axis Max value</label>
              <input
                type="number"
                value={xMaxValInput}
                onChange={(e) => setXMaxValInput(e.target.value)}
                className="input-field"
                style={styles.smallInput}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Y-Axis Max value</label>
              <input
                type="number"
                value={yMaxValInput}
                onChange={(e) => setYMaxValInput(e.target.value)}
                className="input-field"
                style={styles.smallInput}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Map to Image */}
        <div style={styles.configSection}>
          <div style={styles.configHeader}>
            <span style={styles.stepBadge}>2</span>
            <span style={styles.stepTitle}>Position reference nodes</span>
          </div>
          <p style={styles.sectionDesc}>
            Click each button, then click the correct pixel coordinates on the left graph.
          </p>

          <div style={styles.buttonStack}>
            <button
              onClick={() => setActiveMode('origin')}
              className={`btn btn-sm ${activeMode === 'origin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <MapPin size={14} style={{ color: refOrigin.pixel ? '#10b981' : 'inherit' }} />
              <span>Map Origin reference</span>
              {refOrigin.pixel ? (
                <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: '#10b981' }} />
              ) : null}
            </button>

            <button
              onClick={() => setActiveMode('xmax')}
              className={`btn btn-sm ${activeMode === 'xmax' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <MapPin size={14} style={{ color: refXMax.pixel ? '#00f2fe' : 'inherit' }} />
              <span>Map X-Max reference</span>
              {refXMax.pixel ? (
                <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: '#00f2fe' }} />
              ) : null}
            </button>

            <button
              onClick={() => setActiveMode('ymax')}
              className={`btn btn-sm ${activeMode === 'ymax' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start' }}
            >
              <MapPin size={14} style={{ color: refYMax.pixel ? '#a855f7' : 'inherit' }} />
              <span>Map Y-Max reference</span>
              {refYMax.pixel ? (
                <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: '#a855f7' }} />
              ) : null}
            </button>
          </div>

          {isCalibrated() && (
            <button onClick={clearCalibration} className="btn btn-ghost btn-sm" style={{ marginTop: '10px', color: 'var(--accent-rose)' }}>
              <RefreshCw size={12} /> Reset References
            </button>
          )}
        </div>

        {/* Step 3: Digitize / Plot Points */}
        <div style={styles.configSection}>
          <div style={styles.configHeader}>
            <span style={styles.stepBadge}>3</span>
            <span style={styles.stepTitle}>Interactive digitization</span>
          </div>

          {!isCalibrated() ? (
            <div className="glass-panel" style={styles.warningCard}>
              <p style={{ fontSize: '12px', margin: 0 }}>
                ⚠️ Set all 3 reference coordinates to unlock digitization plotting.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
              {/* Series Picker */}
              <div style={styles.seriesSelectorRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.inputLabel}>Active Series</label>
                  <select
                    value={selectedSeriesIdx}
                    onChange={(e) => setSelectedSeriesIdx(parseInt(e.target.value))}
                    className="input-field"
                    style={{ width: '100%', padding: '6px 10px', fontSize: '13px' }}
                  >
                    {dataSeries.map((s, idx) => (
                      <option key={idx} value={idx}>
                        {s.name} ({s.data.length} pts)
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addEmptySeries}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-end', padding: '8px' }}
                  title="Add new series"
                >
                  <ListPlus size={16} />
                </button>
              </div>

              {/* Toggle Plotting */}
              <button
                onClick={() => setActiveMode(activeMode === 'add_point' ? 'idle' : 'add_point')}
                className={`btn btn-sm ${activeMode === 'add_point' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%' }}
              >
                <Plus size={14} />
                <span>{activeMode === 'add_point' ? 'Stop Plotting' : 'Click graph to Plot points'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Series Coordinates List */}
        {isCalibrated() && dataSeries[selectedSeriesIdx] && (
          <div style={styles.pointListContainer}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Digitized Points ({dataSeries[selectedSeriesIdx].name})
            </span>
            <div style={styles.pointList}>
              {dataSeries[selectedSeriesIdx].data.length === 0 ? (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No points plotted.</span>
              ) : (
                dataSeries[selectedSeriesIdx].data.map((pt, idx) => (
                  <div key={idx} style={styles.pointRow}>
                    <span className="mono" style={{ fontSize: '12px' }}>
                      ({pt.x}, {pt.y})
                    </span>
                    <button
                      onClick={() => removePoint(selectedSeriesIdx, idx)}
                      style={styles.pointRemoveBtn}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '16px',
    alignItems: 'start',
    width: '100%',
  },
  workspace: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '500px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  canvasContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    padding: '12px',
    overflow: 'auto' as const,
  },
  workspaceImg: {
    maxWidth: '100%',
    maxHeight: '70vh',
    display: 'block',
    userSelect: 'none' as const,
  },
  refMarker: {
    position: 'absolute' as const,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 6px',
    borderRadius: '4px',
    boxShadow: 'var(--shadow-md)',
    fontSize: '9px',
    fontWeight: 700,
    color: '#060913',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    zIndex: 20,
  },
  markerText: {
    textShadow: '0 1px 1px rgba(255, 255, 255, 0.5)',
  },
  dataDot: {
    position: 'absolute' as const,
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
  },
  dotRemoveBtn: {
    position: 'absolute' as const,
    top: '-8px',
    right: '-8px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: '#f43f5e',
    color: '#fff',
    border: 'none',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    boxShadow: 'var(--shadow-sm)',
  },
  controls: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  configSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  configHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-glow)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: 600,
  },
  sectionDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  inputLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
  },
  smallInput: {
    padding: '6px 8px',
    fontSize: '12px',
    width: '100%',
  },
  buttonStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  warningCard: {
    padding: '10px',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
    color: 'var(--accent-amber)',
  },
  seriesSelectorRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  pointListContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '16px',
  },
  pointList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    maxHeight: '180px',
    overflowY: 'auto' as const,
    paddingRight: '4px',
  },
  pointRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: '4px',
    padding: '4px 8px',
  },
  pointRemoveBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  }
};
