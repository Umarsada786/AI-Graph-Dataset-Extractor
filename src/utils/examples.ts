export interface ExampleGraph {
  id: string;
  title: string;
  description: string;
  graph_type: 'line' | 'bar' | 'scatter' | 'pie';
  axes: {
    x_axis: string;
    y_axis: string;
  };
  data_series: {
    name: string;
    data: { x: string | number; y: number }[];
  }[];
  confidence: number;
  assumptions: string[];
  // Insights generated for research mode
  research_insights?: {
    narrative: string;
    key_takeaways: string[];
  };
}

export const EXAMPLES: ExampleGraph[] = [
  {
    id: 'global-temp',
    title: 'Global Land-Ocean Temperature Anomaly',
    description: 'Yearly temperature anomaly (°C) relative to the 1951-1980 average.',
    graph_type: 'line',
    axes: {
      x_axis: 'Year',
      y_axis: 'Anomaly (°C)'
    },
    data_series: [
      {
        name: 'Global Temperature Anomaly',
        data: [
          { x: 1950, y: -0.17 },
          { x: 1960, y: -0.03 },
          { x: 1970, y: 0.03 },
          { x: 1980, y: 0.26 },
          { x: 1990, y: 0.45 },
          { x: 2000, y: 0.39 },
          { x: 2010, y: 0.72 },
          { x: 2020, y: 1.02 },
          { x: 2023, y: 1.17 }
        ]
      }
    ],
    confidence: 0.96,
    assumptions: [
      'X-axis is represented in calendar years.',
      'Y-axis scales linearly from -0.5°C to 1.5°C.',
      'Data points are smoothed measurements representing annual averages.'
    ],
    research_insights: {
      narrative: 'The dataset clearly demonstrates an accelerating global warming trend. The temperature anomaly remained below or near 0°C until the mid-1970s, after which a strong positive linear trajectory is visible. The decade between 2010 and 2020 experienced a growth rate of over 40%, with 2023 representing the highest anomaly recorded in the series, indicating critical climatic shifts.',
      key_takeaways: [
        'Clear warming trend beginning around 1970.',
        '2023 is the warmest year in this series at +1.17°C.',
        'Decadal rate of change indicates accelerating positive anomaly.'
      ]
    }
  },
  {
    id: 'hardware-sales',
    title: 'Q4 Hardware Sales Distribution',
    description: 'Distribution of hardware division sales revenues across core product lines.',
    graph_type: 'bar',
    axes: {
      x_axis: 'Product Category',
      y_axis: 'Revenue (USD Millions)'
    },
    data_series: [
      {
        name: 'Revenue',
        data: [
          { x: 'Laptops', y: 450 },
          { x: 'Desktops', y: 220 },
          { x: 'Monitors', y: 180 },
          { x: 'Accessories', y: 95 },
          { x: 'Printers', y: 45 }
        ]
      }
    ],
    confidence: 0.98,
    assumptions: [
      'X-axis labels are discrete categorical product types.',
      'Y-axis starts at 0 and scales linearly to 500.',
      'Values represent gross quarterly revenue figures.'
    ],
    research_insights: {
      narrative: 'Laptop hardware continues to dominate the sales distribution, contributing $450M which represents nearly 45.4% of total revenue. Desktops and Monitors form a secondary tier of revenue. Accessories and Printers are minor contributors, indicating that corporate hardware purchasing is heavily skewed towards portable computing.',
      key_takeaways: [
        'Laptops are the primary revenue driver, exceeding Desktops by over 2x.',
        'Total hardware revenue aggregates to $990 Million.',
        'Printers represent the smallest category at just 4.5% of sales.'
      ]
    }
  },
  {
    id: 'drug-dosage',
    title: 'Clinical Trial: Dosage vs. Recovery',
    description: 'Scatter analysis showing the correlation between active substance dosage and patient recovery time.',
    graph_type: 'scatter',
    axes: {
      x_axis: 'Dosage (mg)',
      y_axis: 'Recovery Time (Hours)'
    },
    data_series: [
      {
        name: 'Active Drug Group',
        data: [
          { x: 10, y: 48 },
          { x: 20, y: 36 },
          { x: 30, y: 24 },
          { x: 40, y: 18 },
          { x: 50, y: 12 },
          { x: 60, y: 10 }
        ]
      },
      {
        name: 'Placebo Group',
        data: [
          { x: 10, y: 52 },
          { x: 20, y: 50 },
          { x: 30, y: 48 },
          { x: 40, y: 51 },
          { x: 50, y: 49 },
          { x: 60, y: 47 }
        ]
      }
    ],
    confidence: 0.94,
    assumptions: [
      'Dosage is measured in milligrams (mg).',
      'Recovery time is measured in hours.',
      'Multi-series data tracks two independent cohorts.'
    ],
    research_insights: {
      narrative: 'A strong negative correlation ($r \\approx -0.98$) is observed in the Active Drug Group, demonstrating that increasing dosage levels up to 50mg leads to significantly shorter recovery times. Recovery time plateaus between 50mg and 60mg. In contrast, the Placebo Group shows no significant change across all simulated dosages ($r \\approx -0.42$), confirming drug efficacy.',
      key_takeaways: [
        'Strong dose-dependent recovery acceleration for active cohort.',
        'Recovery efficiency gains diminish above 50mg.',
        'Placebo group maintains steady, elevated recovery times.'
      ]
    }
  }
];

/**
 * Draws a chart dynamically onto an HTML canvas and returns a base64 image data URL.
 * This simulates actual uploaded file visuals for the demo mode.
 */
export function generateExampleImage(id: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const example = EXAMPLES.find(e => e.id === id);
  if (!example) return '';

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid Lines Background
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#94a3b8';

  const chartX = 80;
  const chartY = 60;
  const chartW = 660;
  const chartH = 360;

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(example.title, chartX, 35);

  // Subtitle
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 12px sans-serif';
  ctx.fillText(example.description, chartX, 52);

  // Axes lines
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartX, chartY);
  ctx.lineTo(chartX, chartY + chartH);
  ctx.lineTo(chartX + chartW, chartY + chartH);
  ctx.stroke();

  // Draw chart based on type
  if (example.graph_type === 'line') {
    const series = example.data_series[0];
    const data = series.data;
    const xMin = Number(data[0].x);
    const xMax = Number(data[data.length - 1].x);
    const yMin = -0.5;
    const yMax = 1.5;

    // Draw horizontal grid lines & labels
    const yTicks = [-0.5, 0, 0.5, 1.0, 1.5];
    yTicks.forEach(tick => {
      const py = chartY + chartH - ((tick - yMin) / (yMax - yMin)) * chartH;
      ctx.strokeStyle = tick === 0 ? '#64748b' : '#1e293b';
      ctx.lineWidth = tick === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(chartX, py);
      ctx.lineTo(chartX + chartW, py);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(tick.toFixed(1) + '°C', chartX - 55, py + 5);
    });

    // Draw vertical grid lines & labels
    data.forEach(d => {
      const dx = Number(d.x);
      const px = chartX + ((dx - xMin) / (xMax - xMin)) * chartW;
      
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(px, chartY);
      ctx.lineTo(px, chartY + chartH);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(String(dx), px - 15, chartY + chartH + 20);
    });

    // Plot line
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, idx) => {
      const dx = Number(d.x);
      const dy = d.y;
      const px = chartX + ((dx - xMin) / (xMax - xMin)) * chartW;
      const py = chartY + chartH - ((dy - yMin) / (yMax - yMin)) * chartH;

      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Plot dots
    ctx.fillStyle = '#7f00ff';
    data.forEach(d => {
      const dx = Number(d.x);
      const dy = d.y;
      const px = chartX + ((dx - xMin) / (xMax - xMin)) * chartW;
      const py = chartY + chartH - ((dy - yMin) / (yMax - yMin)) * chartH;

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Axes Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(example.axes.x_axis, chartX + chartW / 2 - 20, chartY + chartH + 45);
    
    ctx.save();
    ctx.translate(20, chartY + chartH / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(example.axes.y_axis, 0, 0);
    ctx.restore();

  } else if (example.graph_type === 'bar') {
    const series = example.data_series[0];
    const data = series.data;
    const yMax = 500;
    const numBars = data.length;
    const gap = 30;
    const barW = (chartW - (gap * (numBars + 1))) / numBars;

    // Draw horizontal grid lines & labels
    const yTicks = [0, 100, 200, 300, 400, 500];
    yTicks.forEach(tick => {
      const py = chartY + chartH - (tick / yMax) * chartH;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(chartX, py);
      ctx.lineTo(chartX + chartW, py);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(String(tick), chartX - 45, py + 5);
    });

    // Plot bars
    data.forEach((d, idx) => {
      const px = chartX + gap + idx * (barW + gap);
      const barH = (d.y / yMax) * chartH;
      const py = chartY + chartH - barH;

      // Gradient for bar
      const grad = ctx.createLinearGradient(px, py, px, chartY + chartH);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(1, '#7f00ff');
      
      ctx.fillStyle = grad;
      ctx.fillRect(px, py, barW, barH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(px, py, barW, barH);

      // Label inside/above bar
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`$${d.y}M`, px + barW/2 - 18, py - 8);

      // Category label
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(String(d.x), px + barW/2 - 25, chartY + chartH + 20);
    });

    // Axes Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(example.axes.x_axis, chartX + chartW / 2 - 40, chartY + chartH + 45);
    
    ctx.save();
    ctx.translate(20, chartY + chartH / 2 + 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(example.axes.y_axis, 0, 0);
    ctx.restore();

  } else if (example.graph_type === 'scatter') {
    const activeData = example.data_series[0].data;
    const placeboData = example.data_series[1].data;
    
    const xMin = 0;
    const xMax = 70;
    const yMin = 0;
    const yMax = 60;

    // Draw grid lines
    const xTicks = [10, 20, 30, 40, 50, 60];
    const yTicks = [10, 20, 30, 40, 50, 60];

    yTicks.forEach(tick => {
      const py = chartY + chartH - ((tick - yMin) / (yMax - yMin)) * chartH;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(chartX, py);
      ctx.lineTo(chartX + chartW, py);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(String(tick), chartX - 30, py + 5);
    });

    xTicks.forEach(tick => {
      const px = chartX + ((tick - xMin) / (xMax - xMin)) * chartW;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(px, chartY);
      ctx.lineTo(px, chartY + chartH);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(String(tick), px - 8, chartY + chartH + 20);
    });

    // Plot active group (dots)
    ctx.fillStyle = '#00f2fe';
    activeData.forEach(d => {
      const px = chartX + ((Number(d.x) - xMin) / (xMax - xMin)) * chartW;
      const py = chartY + chartH - ((d.y - yMin) / (yMax - yMin)) * chartH;
      
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Plot placebo group (triangles)
    ctx.fillStyle = '#f43f5e';
    placeboData.forEach(d => {
      const px = chartX + ((Number(d.x) - xMin) / (xMax - xMin)) * chartW;
      const py = chartY + chartH - ((d.y - yMin) / (yMax - yMin)) * chartH;
      
      ctx.beginPath();
      ctx.moveTo(px, py - 7);
      ctx.lineTo(px + 7, py + 7);
      ctx.lineTo(px - 7, py + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Legend
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(chartX + chartW - 180, chartY + 10, 170, 70);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(chartX + chartW - 180, chartY + 10, 170, 70);

    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(chartX + chartW - 160, chartY + 30, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('Active Drug Group', chartX + chartW - 140, chartY + 34);

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(chartX + chartW - 160, chartY + 48);
    ctx.lineTo(chartX + chartW - 154, chartY + 60);
    ctx.lineTo(chartX + chartW - 166, chartY + 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('Placebo Group', chartX + chartW - 140, chartY + 57);

    // Axes Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(example.axes.x_axis, chartX + chartW / 2 - 40, chartY + chartH + 45);
    
    ctx.save();
    ctx.translate(20, chartY + chartH / 2 + 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(example.axes.y_axis, 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
