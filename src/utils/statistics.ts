export interface DataPoint {
  x: string | number;
  y: number;
}

export interface SeriesData {
  name: string;
  data: DataPoint[];
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  growthRate: number | null; // Overall percentage growth (first value to last value)
  cagr: number | null; // Compound Annual Growth Rate if x looks like years
  correlation: number | null; // Pearson r
  regression: {
    slope: number;
    intercept: number;
    rSquare: number;
    equation: string;
  } | null;
}

/**
 * Checks if a value can be parsed as a number.
 */
export const isNumeric = (val: any): boolean => {
  if (typeof val === 'number') return !isNaN(val);
  if (typeof val === 'string') {
    const num = Number(val);
    return !isNaN(num) && val.trim() !== '';
  }
  return false;
};

/**
 * Calculates statistics for a single data series.
 */
export function calculateSeriesStats(series: SeriesData): StatisticalSummary | null {
  const data = series.data;
  if (!data || data.length === 0) return null;

  const yValues = data.map(d => Number(d.y)).filter(v => !isNaN(v));
  if (yValues.length === 0) return null;

  // Sorting helps with median and growth rates
  const sortedY = [...yValues].sort((a, b) => a - b);
  const min = sortedY[0];
  const max = sortedY[sortedY.length - 1];
  
  // Mean
  const sum = yValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / yValues.length;

  // Median
  const mid = Math.floor(sortedY.length / 2);
  const median = sortedY.length % 2 !== 0 ? sortedY[mid] : (sortedY[mid - 1] + sortedY[mid]) / 2;

  // Standard Deviation
  const variance = yValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / yValues.length;
  const stdDev = Math.sqrt(variance);

  // Growth rate (First to Last)
  let growthRate: number | null = null;
  let cagr: number | null = null;
  
  if (data.length >= 2) {
    const firstY = Number(data[0].y);
    const lastY = Number(data[data.length - 1].y);
    if (!isNaN(firstY) && !isNaN(lastY) && firstY !== 0) {
      growthRate = ((lastY - firstY) / firstY) * 100;
      
      // Attempt CAGR if X is years
      const firstX = Number(data[0].x);
      const lastX = Number(data[data.length - 1].x);
      if (isNumeric(data[0].x) && isNumeric(data[data.length - 1].x)) {
        const yearDiff = lastX - firstX;
        if (yearDiff > 0 && firstY > 0 && lastY > 0) {
          cagr = (Math.pow(lastY / firstY, 1 / yearDiff) - 1) * 100;
        }
      }
    }
  }

  // Regression & Correlation (requires numeric X and at least 2 points)
  let correlation: number | null = null;
  let regression: StatisticalSummary['regression'] = null;

  const numericPoints = data.map(d => ({
    x: Number(d.x),
    y: Number(d.y)
  })).filter(p => !isNaN(p.x) && !isNaN(p.y));

  if (numericPoints.length >= 2) {
    const n = numericPoints.length;
    const sumX = numericPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = numericPoints.reduce((acc, p) => acc + p.y, 0);
    const sumXY = numericPoints.reduce((acc, p) => acc + (p.x * p.y), 0);
    const sumX2 = numericPoints.reduce((acc, p) => acc + (p.x * p.x), 0);
    const sumY2 = numericPoints.reduce((acc, p) => acc + (p.y * p.y), 0);

    // Pearson Correlation Coefficient (r)
    const numeratorR = (n * sumXY) - (sumX * sumY);
    const denominatorR = Math.sqrt(((n * sumX2) - Math.pow(sumX, 2)) * ((n * sumY2) - Math.pow(sumY, 2)));
    correlation = denominatorR !== 0 ? numeratorR / denominatorR : null;

    // Linear Regression (y = mx + c)
    const denominatorSlope = (n * sumX2) - Math.pow(sumX, 2);
    if (denominatorSlope !== 0) {
      const slope = ((n * sumXY) - (sumX * sumY)) / denominatorSlope;
      const intercept = (sumY - (slope * sumX)) / n;
      
      // R-squared
      const meanY = sumY / n;
      const ssTot = numericPoints.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0);
      const ssRes = numericPoints.reduce((acc, p) => acc + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
      const rSquare = ssTot !== 0 ? 1 - (ssRes / ssTot) : 1;

      const sign = intercept >= 0 ? '+' : '-';
      const absIntercept = Math.abs(intercept).toFixed(4);
      const equation = `y = ${slope.toFixed(4)}x ${sign} ${absIntercept}`;

      regression = {
        slope,
        intercept,
        rSquare,
        equation
      };
    }
  }

  return {
    mean,
    median,
    stdDev,
    min,
    max,
    growthRate,
    cagr,
    correlation,
    regression
  };
}

/**
 * Formats multiple series data to a single unified CSV string.
 */
export function formatToCSV(seriesList: SeriesData[]): string {
  if (seriesList.length === 0) return '';

  // Get union of all unique X values to make a tabular format
  const allXValues = new Set<string>();
  seriesList.forEach(series => {
    series.data.forEach(d => {
      allXValues.add(String(d.x));
    });
  });

  // Sort X values (numerically if possible, otherwise alphabetically)
  const sortedX = Array.from(allXValues).sort((a, b) => {
    if (isNumeric(a) && isNumeric(b)) {
      return Number(a) - Number(b);
    }
    return a.localeCompare(b);
  });

  // Header row
  const headers = ['x', ...seriesList.map(s => s.name)];
  const rows = [headers.join(',')];

  // Data rows
  sortedX.forEach(xVal => {
    const row = [xVal];
    seriesList.forEach(series => {
      const point = series.data.find(d => String(d.x) === xVal);
      row.push(point !== undefined ? String(point.y) : '');
    });
    rows.push(row.join(','));
  });

  return rows.join('\n');
}
