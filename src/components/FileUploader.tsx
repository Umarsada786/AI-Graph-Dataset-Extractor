import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { convertPDFToImages, type PDFPageImage } from '../utils/pdfHelper';

interface FileUploaderProps {
  onImageSelected: (dataUrl: string, name: string) => void;
  onClear: () => void;
  currentFileName: string | null;
  loading: boolean;
}

export function FileUploader({
  onImageSelected,
  onClear,
  currentFileName,
  loading: _loading
}: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [pdfPages, setPdfPages] = useState<PDFPageImage[]>([]);
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [pdfLoadingStatus, setPdfLoadingStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setPdfPages([]);
    setSelectedPageIdx(0);
    
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name;

    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      setPdfLoadingStatus('Reading PDF document...');
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          if (buffer) {
            try {
              const pages = await convertPDFToImages(buffer, (curr, total) => {
                setPdfLoadingStatus(`Converting PDF page ${curr} of ${total}...`);
              });
              
              if (pages.length > 0) {
                setPdfPages(pages);
                setPdfLoadingStatus(null);
                // Select first page by default
                onImageSelected(pages[0].dataUrl, `${fileName} (Page 1)`);
              } else {
                throw new Error('No pages could be extracted from PDF');
              }
            } catch (err: any) {
              console.error(err);
              setErrorMsg('Failed to render PDF pages. Make sure the file is not corrupted.');
              setPdfLoadingStatus(null);
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        setErrorMsg('Error reading PDF file.');
        setPdfLoadingStatus(null);
      }
    } else if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          onImageSelected(dataUrl, fileName);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMsg('Unsupported file format. Please upload an image (PNG, JPG, WebP) or PDF.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePageSelect = (idx: number) => {
    if (!currentFileName) return;
    setSelectedPageIdx(idx);
    // Strip original (Page X) suffix if present to update correctly
    const baseName = currentFileName.replace(/\s\(Page\s\d+\)$/, '');
    onImageSelected(pdfPages[idx].dataUrl, `${baseName} (Page ${idx + 1})`);
  };

  return (
    <div style={styles.container}>
      {pdfLoadingStatus ? (
        <div className="glass-panel flex-center" style={styles.loadingArea}>
          <Loader2 size={36} className="text-gradient" style={styles.spinner} />
          <span style={{ fontWeight: 500, fontSize: '15px' }}>{pdfLoadingStatus}</span>
        </div>
      ) : pdfPages.length > 0 ? (
        <div style={styles.pdfBrowserContainer}>
          {/* PDF Pages Selector Header */}
          <div className="glass-panel" style={styles.pdfHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} className="text-gradient" />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                {currentFileName?.replace(/\s\(Page\s\d+\)$/, '')}
              </span>
              <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                {pdfPages.length} {pdfPages.length === 1 ? 'Page' : 'Pages'}
              </span>
            </div>

            <div style={styles.pdfControls}>
              <button
                disabled={selectedPageIdx === 0}
                onClick={() => handlePageSelect(selectedPageIdx - 1)}
                className="btn btn-secondary btn-sm"
                style={styles.controlBtn}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>
                Page {selectedPageIdx + 1} of {pdfPages.length}
              </span>
              <button
                disabled={selectedPageIdx === pdfPages.length - 1}
                onClick={() => handlePageSelect(selectedPageIdx + 1)}
                className="btn btn-secondary btn-sm"
                style={styles.controlBtn}
              >
                <ChevronRight size={16} />
              </button>
              
              <button onClick={onClear} className="btn btn-danger btn-sm" style={{ marginLeft: '12px' }}>
                Change File
              </button>
            </div>
          </div>

          {/* Page Picker Carousel Bar */}
          {pdfPages.length > 1 && (
            <div style={styles.thumbnailBar}>
              {pdfPages.map((page, idx) => (
                <button
                  key={page.pageNumber}
                  onClick={() => handlePageSelect(idx)}
                  style={{
                    ...styles.thumbnailBtn,
                    borderColor: selectedPageIdx === idx ? 'var(--primary)' : 'transparent',
                    boxShadow: selectedPageIdx === idx ? 'var(--shadow-glow)' : 'none'
                  }}
                >
                  <img src={page.dataUrl} alt={`Page ${idx + 1}`} style={styles.thumbnailImg} />
                  <span style={styles.thumbnailLabel}>{idx + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`glass-panel ${isDragActive ? 'glow-border' : ''}`}
          style={{
            ...styles.dropzone,
            borderColor: isDragActive ? 'var(--primary)' : 'var(--border-glass)',
            backgroundColor: isDragActive ? 'rgba(0, 242, 254, 0.02)' : 'var(--bg-card)'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
          />

          <div style={styles.dropzoneContent}>
            <div className="flex-center" style={styles.iconContainer}>
              <UploadCloud size={32} className="text-gradient" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>
                Upload Graph Image or PDF
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Drag and drop your file here, or click to browse
              </p>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoBadge}>PNG</span>
              <span style={styles.infoBadge}>JPG</span>
              <span style={styles.infoBadge}>WEBP</span>
              <span style={styles.infoBadge}>PDF</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="glass-panel flex-center animate-fade-in" style={styles.errorArea}>
          <AlertCircle size={16} style={{ color: 'var(--accent-rose)', marginRight: '8px' }} />
          <span style={{ fontSize: '13px', color: 'var(--accent-rose)' }}>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  dropzone: {
    border: '2px dashed var(--border-glass)',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
  },
  infoRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  infoBadge: {
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-glass)',
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
  },
  loadingArea: {
    padding: '40px 20px',
    flexDirection: 'column' as const,
    gap: '16px',
    minHeight: '200px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  pdfBrowserContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  pdfHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-card)',
  },
  pdfControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  controlBtn: {
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto' as const,
    padding: '8px 4px',
    backgroundColor: 'rgba(3, 7, 18, 0.2)',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
  },
  thumbnailBtn: {
    position: 'relative' as const,
    flex: '0 0 70px',
    height: '90px',
    padding: '2px',
    border: '2px solid transparent',
    borderRadius: '6px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#0f172a',
    transition: 'all 0.2s',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  thumbnailLabel: {
    position: 'absolute' as const,
    bottom: '4px',
    right: '4px',
    fontSize: '9px',
    fontWeight: 700,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    padding: '1px 4px',
    borderRadius: '3px',
  },
  errorArea: {
    marginTop: '12px',
    padding: '10px 14px',
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
    borderColor: 'rgba(244, 63, 94, 0.15)',
    justifyContent: 'flex-start',
  }
};
