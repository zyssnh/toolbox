import React, { useState, useCallback } from 'react';
import { useTheme } from '../../theme';

export default function DevUrl() {
  const t = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEncode = useCallback(() => {
    try {
      setError('');
      setOutput(encodeURIComponent(input));
    } catch {
      setError('编码失败');
      setOutput('');
    }
  }, [input]);

  const handleDecode = useCallback(() => {
    try {
      setError('');
      setOutput(decodeURIComponent(input));
    } catch (e: any) {
      setError('解码失败: ' + (e.message || '未知错误'));
      setOutput('');
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [output]);

  const styles: Record<string, React.CSSProperties> = {
    container: { padding: 20 },
    textarea: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: t.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
      width: '100%',
      minHeight: 100,
      resize: 'vertical',
      boxSizing: 'border-box',
      outline: 'none',
      lineHeight: 1.6,
    },
    label: { color: t.textSecondary, fontSize: 13, marginBottom: 6 },
    btnRow: { display: 'flex', gap: 10, margin: '12px 0' },
    primaryBtn: {
      background: t.primary,
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '8px 20px',
      cursor: 'pointer',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
    },
    secondaryBtn: {
      background: t.hover,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '8px 20px',
      color: t.text,
      cursor: 'pointer',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
    },
    error: { color: '#f64747', fontSize: 13, marginTop: 8, fontFamily: "'JetBrains Mono', monospace" },
  };

  return (
    <div style={styles.container}>
      {/* Input */}
      <div style={styles.label}>输入</div>
      <textarea
        style={styles.textarea}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError('');
        }}
        placeholder="输入要编码/解码的文本..."
      />

      {/* Buttons */}
      <div style={styles.btnRow}>
        <button style={styles.primaryBtn} onClick={handleEncode}>
          编码 (Encode)
        </button>
        <button style={styles.primaryBtn} onClick={handleDecode}>
          解码 (Decode)
        </button>
      </div>

      {/* Error */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Output */}
      <div style={{ ...styles.label, marginTop: 16 }}>输出</div>
      <textarea
        style={{
          ...styles.textarea,
          color: error ? '#f64747' : t.green,
        }}
        value={output}
        readOnly
        placeholder="编码/解码结果将显示在这里..."
      />
      {output && (
        <div style={{ marginTop: 8 }}>
          <button style={styles.secondaryBtn} onClick={copyOutput}>
            {copied ? '✓ 已复制' : '复制输出'}
          </button>
        </div>
      )}
    </div>
  );
}
