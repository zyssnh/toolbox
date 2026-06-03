import React, { useState, useMemo } from 'react';
import { useTheme } from '../../theme';

const makeStyles = (t: ReturnType<typeof useTheme>): Record<string, React.CSSProperties> => ({
  wrapper: {
    padding: 20,
  },
  textarea: {
    width: '100%',
    minHeight: 220,
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
  label: {
    color: t.textSecondary,
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
    background: t.card,
    borderRadius: 8,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    border: `0.5px solid ${t.hover}`,
  },
  cardValue: {
    color: t.green,
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardLabel: {
    color: t.textSecondary,
    fontSize: 12,
  },
});

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
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

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
