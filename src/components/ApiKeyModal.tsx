import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, X, ExternalLink, Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export function ApiKeyModal({ isOpen, onClose, onSave, currentKey }: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(currentKey);
      setIsSaved(false);
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keyInput.trim());
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay flex-center" style={styles.overlay}>
      <div className="glass-panel animate-slide-up" style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <Key size={20} className="text-gradient" />
            <h3 style={{ fontSize: '18px' }}>Gemini API Settings</h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '14px', margin: '8px 0 20px', color: 'var(--text-secondary)' }}>
          To extract data from your own custom graphs, connect to Google's multimodal Gemini models. Your key is stored locally in your browser and never sent to any external server besides Google API.
        </p>

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Gemini API Key</label>
            <div style={styles.inputContainer}>
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="input-field"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={styles.eyeBtn}
                className="btn-ghost"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {keyInput && !keyInput.startsWith('AIzaSy') && (
              <span style={styles.warning}>
                Key typically starts with "AIzaSy". Please verify your key.
              </span>
            )}
          </div>

          <div className="glass-panel" style={styles.instructions}>
            <h4 style={styles.insTitle}>How to get a free API Key:</h4>
            <ol style={styles.list}>
              <li>
                Go to the{' '}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Google AI Studio <ExternalLink size={12} style={{ display: 'inline' }} />
                </a>
              </li>
              <li>Sign in with your Google account.</li>
              <li>Click <strong>"Get API key"</strong> in the sidebar.</li>
              <li>Create a new API Key in a new or existing project.</li>
            </ol>
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ minWidth: '100px' }}
            >
              {isSaved ? (
                <>
                  <Check size={14} /> Saved
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 100,
  },
  modal: {
    width: '480px',
    maxWidth: '90%',
    padding: '24px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeBtn: {
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  inputContainer: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    paddingRight: '40px',
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: '8px',
    padding: '4px',
    borderRadius: '4px',
  },
  warning: {
    fontSize: '11px',
    color: 'var(--accent-amber)',
    marginTop: '2px',
  },
  instructions: {
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    fontSize: '13px',
    borderRadius: '8px',
  },
  insTitle: {
    fontSize: '13px',
    marginBottom: '8px',
    color: 'var(--text-primary)',
  },
  list: {
    margin: 0,
    paddingLeft: '20px',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  link: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
};
