import React, { useState, useMemo } from 'react';

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
  label: {
    color: '#888890',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    display: 'block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  card: {
    background: '#141418',
    borderRadius: 8,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    border: '0.5px solid #1A1A1F',
  },
  cardValue: {
    color: '#39D98A',
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardLabel: {
    color: '#888890',
    fontSize: 12,
  },
};

interface Stats {
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  chineseChars: number;
  englishWords: number;
  digits: number;
  lines: number;
  paragraphs: number;
}

function computeStats(text: string): Stats {
  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s/g, '').length;
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const englishWords = (text.match(/\b[a-zA-Z]+\b/g) || []).length;
  const digits = (text.match(/\d/g) || []).length;
  const lines = text === '' ? 0 : text.split('\n').length;
  const paragraphs = text === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim() !== '').length;

  return {
    charsWithSpaces,
    charsWithoutSpaces,
    chineseChars,
    englishWords,
    digits,
    lines,
    paragraphs,
  };
}

const TextWordcount: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => computeStats(text), [text]);

  const statItems = [
    { label: '总字符数 (含空格)', value: stats.charsWithSpaces },
    { label: '总字符数 (不含空格)', value: stats.charsWithoutSpaces },
    { label: '汉字数', value: stats.chineseChars },
    { label: '英文单词数', value: stats.englishWords },
    { label: '数字数', value: stats.digits },
    { label: '行数', value: stats.lines },
    { label: '段落数', value: stats.paragraphs },
  ];

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>文本输入</label>
      <textarea
        style={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入或粘贴文本进行字数统计..."
      />
      <div style={styles.grid}>
        {statItems.map((item) => (
          <div key={item.label} style={styles.card}>
            <span style={styles.cardValue}>{item.value.toLocaleString()}</span>
            <span style={styles.cardLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextWordcount;
