import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../theme';

const makeStyles = (t: ReturnType<typeof useTheme>): Record<string, React.CSSProperties> => ({
  container: {
    padding: 20,
    fontFamily: "'JetBrains Mono', monospace",
    color: t.text,
    background: t.bg,
    minHeight: '100%',
  },
  section: {
    background: t.card,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    color: t.purple,
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16,
  },
  label: {
    color: t.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    display: 'block',
  },
  input: {
    width: '100%',
    background: t.inputBg,
    border: `0.5px solid ${t.border}`,
    borderRadius: 6,
    padding: '8px 12px',
    color: t.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  button: {
    background: t.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 20px',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
  },
  result: {
    background: t.inputBg,
    border: `0.5px solid ${t.border}`,
    borderRadius: 8,
    padding: 16,
    fontFamily: "'JetBrains Mono', monospace",
    color: t.green,
    fontSize: 14,
    wordBreak: 'break-all',
  },
  largeTimestamp: {
    color: t.green,
    fontSize: 32,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    textAlign: 'center' as const,
    padding: '16px 0',
  },
  row: {
    marginBottom: 16,
  },
  hint: {
    color: t.textHint,
    fontSize: 12,
    marginTop: 8,
  },
});

export default function TimeTimestamp() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  const [timestampInput, setTimestampInput] = useState('');
  const [datetimeInput, setDatetimeInput] = useState('');
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);
  const [convertedDatetime, setConvertedDatetime] = useState('');
  const [convertedTimestamp, setConvertedTimestamp] = useState('');
  const [timestampError, setTimestampError] = useState('');

  const handleTimestampChange = useCallback((value: string) => {
    setTimestampInput(value);
    const ts = parseInt(value, 10);
    if (isNaN(ts) || value === '') {
      setConvertedDatetime('');
      setTimestampError('');
      return;
    }
    if (ts < 0) {
      setConvertedDatetime('');
      setTimestampError('时间戳不能为负数');
      return;
    }
    setTimestampError('');
    const date = new Date(ts * 1000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    setConvertedDatetime(`${y}-${m}-${d} ${h}:${min}:${s}`);
  }, []);

  const handleDatetimeChange = useCallback((value: string) => {
    setDatetimeInput(value);
    if (!value) {
      setConvertedTimestamp('');
      return;
    }
    const ts = Math.floor(new Date(value).getTime() / 1000);
    if (isNaN(ts)) {
      setConvertedTimestamp('');
      return;
    }
    setConvertedTimestamp(String(ts));
  }, []);

  const handleGetCurrentTimestamp = useCallback(() => {
    const now = Date.now();
    const ts = Math.floor(now / 1000);
    setCurrentTimestamp(ts);
    setTimestampInput(String(ts));
    const d = new Date(now);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const dtLocal = `${y}-${m}-${day}T${h}:${min}`;
    setDatetimeInput(dtLocal);
    setConvertedDatetime(`${y}-${m}-${day} ${h}:${min}:${s}`);
    setConvertedTimestamp(String(ts));
    setTimestampError('');
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={styles.sectionHeader}>当前时间戳</div>
        <div style={styles.largeTimestamp}>
          {currentTimestamp !== null ? currentTimestamp : '—'}
        </div>
        <button style={styles.button} onClick={handleGetCurrentTimestamp}>
          获取当前时间戳
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>时间戳 → 日期时间</div>
        <div style={styles.row}>
          <label style={styles.label}>Unix 时间戳（秒）</label>
          <input
            style={styles.input}
            type="number"
            placeholder="例如: 1717401600"
            value={timestampInput}
            onChange={(e) => handleTimestampChange(e.target.value)}
          />
          {timestampError && <div style={styles.hint}>{timestampError}</div>}
        </div>
        {convertedDatetime && (
          <div style={styles.result}>{convertedDatetime}</div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>日期时间 → 时间戳</div>
        <div style={styles.row}>
          <label style={styles.label}>选择日期时间</label>
          <input
            style={styles.input}
            type="datetime-local"
            value={datetimeInput}
            onChange={(e) => handleDatetimeChange(e.target.value)}
          />
        </div>
        {convertedTimestamp && (
          <div style={styles.result}>{convertedTimestamp}</div>
        )}
      </div>
    </div>
  );
}
