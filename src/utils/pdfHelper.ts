import * as pdfjsLib from 'pdfjs-dist';

// Set worker source URL using a reliable CDN matching the installed version
// We use the modern mjs worker structure.
const pdfjsVersion = pdfjsLib.version || '4.0.370';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`;

export interface PDFPageImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Converts a PDF file (as ArrayBuffer) into an array of page images.
 * Useful for rendering PDF pages as images for visualization and Gemini Multimodal input.
 */
export async function convertPDFToImages(
  pdfBuffer: ArrayBuffer,
  progressCallback?: (current: number, total: number) => void
): Promise<PDFPageImage[]> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBuffer,
      useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageImages: PDFPageImage[] = [];

    for (let i = 1; i <= numPages; i++) {
      if (progressCallback) {
        progressCallback(i, numPages);
      }

      const page = await pdf.getPage(i);
      
      // Use a scale of 2.0 for higher DPI, vital for OCR accuracy
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not create 2D canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      };

      await page.render(renderContext).promise;
      
      const dataUrl = canvas.toDataURL('image/png');
      pageImages.push({
        pageNumber: i,
        dataUrl,
        width: viewport.width,
        height: viewport.height
      });

      // Free page resources
      page.cleanup();
    }

    return pageImages;
  } catch (error) {
    console.error('Error during PDF conversion:', error);
    throw error;
  }
}
