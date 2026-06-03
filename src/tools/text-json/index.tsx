import React, { useState, useCallback, useMemo } from 'react';

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: 20,
  },
  textarea: {
    width: '100%',
    minHeight: 220,
    background: '#0F0F11',
    border: '0.5px solid #2a2a30',
    borderRadius: 6,
    padding: '8px 12px',
    color: '#E0E0E8',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    lineHeight: 1.6,
    resize: 'vertical' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  toolbar: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  btn: {
    background: '#4F8EF7',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  btnSecondary: {
    background: '#1A1A1F',
    border: '0.5px solid #2a2a30',
    color: '#E0E0E8',
    borderRadius: 6,
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  charCount: {
    color: '#888890',
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    marginLeft: 'auto',
  },
  resultArea: {
    background: '#0F0F11',
    border: '0.5px #2a2a30',
    borderRadius: 8,
    padding: 16,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#39D98A',
    fontSize: 13,
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    marginTop: 16,
    maxHeight: 480,
    overflow: 'auto',
    borderStyle: 'solid',
  },
  errorArea: {
    background: '#0F0F11',
    border: '0.5px solid #FF5C5C',
    borderRadius: 8,
    padding: 16,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#FF5C5C',
    fontSize: 13,
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap' as const,
    marginTop: 16,
  },
  label: {
    color: '#888890',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    display: 'block',
  },
};

const TextJson: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isError, setIsError] = useState(false);

  const charCount = useMemo(() => input.length, [input]);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setResult(JSON.stringify(parsed, null, 2));
      setIsError(false);
    } catch (e: any) {
      setResult(`JSON 解析错误：${e.message}`);
      setIsError(true);
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setResult(JSON.stringify(parsed));
      setIsError(false);
    } catch (e: any) {
      setResult(`JSON 解析错误：${e.message}`);
      setIsError(true);
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    try {
      JSON.parse(input);
      setResult('JSON 格式正确');
      setIsError(false);
    } catch (e: any) {
      setResult(`JSON 格式错误：${e.message}`);
      setIsError(true);
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput('');
    setResult('');
    setIsError(false);
  }, []);

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>JSON 输入</label>
      <textarea
        style={styles.textarea}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='粘贴 JSON 字符串，例如：{"name":"张三","age":25}'
      />
      <div style={styles.toolbar}>
        <button style={styles.btn} onClick={handleFormat}>格式化</button>
        <button style={styles.btn} onClick={handleMinify}>压缩</button>
        <button style={styles.btn} onClick={handleValidate}>校验</button>
        <button style={styles.btnSecondary} onClick={handleClear}>清除</button>
        <span style={styles.charCount}>{charCount} 字符</span>
      </div>
      {result && (
        <div style={isError ? styles.errorArea : styles.resultArea}>
          {result}
        </div>
      )}
    </div>
  );
};

export default TextJson;
