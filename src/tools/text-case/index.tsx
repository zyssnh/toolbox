import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../theme';

const makeStyles = (t: ReturnType<typeof useTheme>): Record<string, React.CSSProperties> => ({
  wrapper: {
    padding: 20,
  },
  textarea: {
    width: '100%',
    minHeight: 180,
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
  btnRow: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
    flexWrap: 'wrap' as const,
  },
  btn: {
    background: t.primary,
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  resultArea: {
    background: t.inputBg,
    border: `0.5px solid ${t.border}`,
    borderRadius: 8,
    padding: 16,
    fontFamily: "'JetBrains Mono', monospace",
    color: t.green,
    fontSize: 14,
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    marginTop: 12,
    minHeight: 60,
  },
  resultToolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  copyBtn: {
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
  emptyResult: {
    color: t.textHint,
  },
});

function splitWords(text: string): string[] {
  return text
    .trim()
    .split(/[\s\-_]+/)
    .filter((w) => w.length > 0);
}

function toCamelCase(text: string): string {
  const words = splitWords(text);
  if (words.length === 0) return '';
  return words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join('');
}

function toPascalCase(text: string): string {
  const words = splitWords(text);
  if (words.length === 0) return '';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toSnakeCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join('_');
}

function toUpperSnakeCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toUpperCase())
    .join('_');
}

function toKebabCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join('-');
}

function toUpperCase(text: string): string {
  return text.toUpperCase();
}

function toLowerCase(text: string): string {
  return text.toLowerCase();
}

function toTitleCase(text: string): string {
  return text.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

type CaseName =
  | 'camelCase'
  | 'PascalCase'
  | 'snake_case'
  | 'UPPER_SNAKE'
  | 'kebab-case'
  | 'UPPER CASE'
  | 'lower case'
  | 'Title Case';

const converters: Record<CaseName, (text: string) => string> = {
  camelCase: toCamelCase,
  PascalCase: toPascalCase,
  snake_case: toSnakeCase,
  UPPER_SNAKE: toUpperSnakeCase,
  'kebab-case': toKebabCase,
  'UPPER CASE': toUpperCase,
  'lower case': toLowerCase,
  'Title Case': toTitleCase,
};

const TextCase: React.FC = () => {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [activeCase, setActiveCase] = useState<CaseName | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(
    (caseName: CaseName) => {
      const converted = converters[caseName](text);
      setResult(converted);
      setActiveCase(caseName);
    },
    [text]
  );

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [result]);

  const caseNames = Object.keys(converters) as CaseName[];

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>英文文本输入</label>
      <textarea
        style={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入英文文本，支持空格、下划线、连字符分隔..."
      />
      <div style={styles.btnRow}>
        {caseNames.map((name) => (
          <button
            key={name}
            style={{
              ...styles.btn,
              ...(activeCase === name
                ? { background: t.green, color: t.bg }
                : {}),
            }}
            onClick={() => handleConvert(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div style={styles.resultArea}>
        <span style={result ? {} : styles.emptyResult}>
          {result || '点击上方按钮查看转换结果'}
        </span>
      </div>
      {result && (
        <div style={styles.resultToolbar}>
          <button
            style={{
              ...styles.copyBtn,
              ...(copied ? styles.copySuccess : {}),
            }}
            onClick={handleCopy}
          >
            {copied ? '已复制' : '复制结果'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TextCase;
