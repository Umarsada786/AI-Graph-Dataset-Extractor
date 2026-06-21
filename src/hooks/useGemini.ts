import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedGraph {
  graph_type: 'line' | 'bar' | 'scatter' | 'pie' | 'unknown';
  title: string;
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
  research_insights?: {
    trend_analysis: string;
    statistical_summary: {
      mean: number;
      growth_rate_pct: number | null;
      correlation_coefficient: number | null;
    };
    detected_insights: string[];
  };
}

export interface GeminiResponse {
  graphs_detected: ExtractedGraph[];
}

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawOutput, setRawOutput] = useState<string>('');

  /**
   * Helper to strip base64 image header
   */
  const getBase64Data = (dataUrl: string): { data: string; mimeType: string } => {
    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format');
    }
    const mimeType = parts[0].split(':')[1];
    const data = parts[1];
    return { data, mimeType };
  };

  /**
   * Main function to extract graph details from an image (base64 string)
   */
  const extractGraphData = async (
    imageSrc: string,
    researchMode: boolean,
    apiKey: string
  ): Promise<GeminiResponse | null> => {
    if (!apiKey) {
      setError('Gemini API key is required. Please add it via Settings.');
      return null;
    }

    setLoading(true);
    setError(null);
    setRawOutput('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // We use the modern gemini-2.5-flash which is multimodal and fast
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const { data, mimeType } = getBase64Data(imageSrc);

      const systemPrompt = `You are an advanced multimodal AI system specialized in extracting structured numerical data from graphs contained in images, screenshots, scanned documents, and PDFs.

Your task is to convert visual graphs into accurate, structured datasets with minimal user interaction and maximum precision.

🎯 CORE OBJECTIVE
Given an input image or PDF containing one or more graphs, you must:
1. Detect all graphs present in the input
2. Identify graph type (line, bar, scatter, pie, mixed)
3. Extract axes labels and scale accurately
4. Digitize all visible data points
5. Reconstruct the original dataset as closely as possible
6. Handle noise, blur, and low-quality scans intelligently

🧠 INTELLIGENCE REQUIREMENTS
- Use OCR to extract all text (titles, labels, legends)
- Infer missing axis labels when possible (mark as inferred)
- Convert pixel coordinates into real numeric values using axis scaling
- Smooth noisy or unclear data points logically
- Detect multiple datasets in one graph (multi-series support)
- Estimate missing points only when necessary and mark them clearly

📊 OUTPUT FORMAT (STRICT JSON ONLY)
Return ONLY valid JSON in this format:
{
  "graphs_detected": [
    {
      "graph_type": "line | bar | scatter | pie | unknown",
      "title": "Detected graph title",
      "axes": {
        "x_axis": "label",
        "y_axis": "label"
      },
      "data_series": [
        {
          "name": "Series 1",
          "data": [
            { "x": "value", "y": "value" }
          ]
        }
      ],
      "confidence": 0.0,
      "assumptions": [
        "List any inferred values or corrections"
      ]
    }
  ]
}

🚫 STRICT RULES
- Output ONLY JSON (no explanation text)
- No markdown, no commentary
- No HTML blocks or other wrapper elements (return purely the JSON structure)
- No hallucinated exact values unless inferred clearly
- Must prioritize accuracy over completeness

${
  researchMode
    ? `
🧠 ADVANCED MODE: RESEARCH MODE ACTIVE
Since the user requested research mode, please also include an additional "research_insights" object inside each graph item in graphs_detected[]:
"research_insights": {
  "trend_analysis": "Summary of overall trends, slopes, mathematical curves fit, or inflections",
  "statistical_summary": {
    "mean": 0.0,
    "growth_rate_pct": 0.0,
    "correlation_coefficient": 0.0
  },
  "detected_insights": [
    "Key research findings, anomalies, spikes, or forecast indicators"
  ]
}
`
    : ''
}
`;

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              {
                inlineData: {
                  mimeType,
                  data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = result.response.text();
      setRawOutput(responseText);

      // Parse JSON
      const parsedData = JSON.parse(responseText) as GeminiResponse;
      
      if (!parsedData || !Array.isArray(parsedData.graphs_detected)) {
        throw new Error('API output does not contain graphs_detected array.');
      }

      return parsedData;
    } catch (err: any) {
      console.error('Error calling Gemini API:', err);
      const errMsg = err?.message || 'An error occurred while contacting the AI model. Please check your API key or network connection.';
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    rawOutput,
    extractGraphData,
    setError
  };
}
export type { ExtractedGraph as ExtractedGraphType };
