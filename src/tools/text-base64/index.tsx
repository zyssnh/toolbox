import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../theme';

const makeStyles = (t: ReturnType<typeof useTheme>): Record<string, React.CSSProperties> => ({
  wrapper: {
    padding: 20,
  },
  container: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  column: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  label: {
    color: t.textSecondary,
    fontSize: 13,
    fontWeight: 500,
  },
  textarea: {
    width: '100%',
    minHeight: 240,
    background: t.inputBg,
    border: `0.5px solid ${t.border}`,
    borderRadius: 6,
    padding: '8px 12px',
    color: t.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    lineHeight: 1.6,
    resize: 'vertical' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  errorText: {
    color: '#FF5C5C',
    fontSize: 12,
    marginTop: 4,
    fontFamily: "'JetBrains Mono', monospace",
  },
  copyBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    background: t.hover,
    border: `0.5px solid ${t.border}`,
    color: t.text,
    borderRadius: 6,
    padding: '6px 16px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
  },
  copySuccess: {
    background: t.green,
    color: t.bg,
    border: 'none',
  },
});

function encodeBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '';
  }
}

function decodeBase64(b64: string): { text: string; error: string | null } {
  try {
    const decoded = decodeURIComponent(escape(atob(b64)));
    try {
      new URLSearchParams(decoded);
    } catch {
      // ignore
    }
    return { text: decoded, error: null };
  } catch {
    return { text: '', error: '无效的 Base64 字符串' };
  }
}

const TextBase64: React.FC = () => {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  const [plainText, setPlainText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [lastEdited, setLastEdited] = useState<'plain' | 'base64'>('plain');
  const [copied, setCopied] = useState(false);

  const handlePlainChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPlainText(val);
    setBase64Text(encodeBase64(val));
    setLastEdited('plain');
    setDecodeError(null);
  }, []);

  const handleBase64Change = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBase64Text(val);
    const { text, error } = decodeBase64(val);
    if (error) {
      setDecodeError(error);
      if (lastEdited === 'base64') {
        setPlainText('');
      }
    } else {
      setDecodeError(null);
      setPlainText(text);
    }
    setLastEdited('base64');
  }, [lastEdited]);

  const handleCopy = useCallback(async () => {
    if (!base64Text) return;
    try {
      await navigator.clipboard.writeText(base64Text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = base64Text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [base64Text]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.column}>
          <label style={styles.label}>原文</label>
          <textarea
            style={styles.textarea}
            value={plainText}
            onChange={handlePlainChange}
            placeholder="输入要编码的文本..."
          />
        </div>
        <div style={styles.column}>
          <label style={styles.label}>Base64</label>
          <textarea
            style={{
              ...styles.textarea,
              ...(decodeError ? { borderColor: '#FF5C5C' } : {}),
            }}
            value={base64Text}
            onChange={handleBase64Change}
            placeholder="输入 Base64 字符串进行解码..."
          />
          {decodeError && <span style={styles.errorText}>{decodeError}</span>}
          <button
            style={{
              ...styles.copyBtn,
              ...(copied ? styles.copySuccess : {}),
            }}
            onClick={handleCopy}
          >
            {copied ? '已复制' : '复制 Base64'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextBase64;
