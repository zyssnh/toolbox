import { useState, useMemo } from 'react';
import { useTheme } from '../../theme';

interface DateDiff {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

function calcDateDiff(d1: Date, d2: Date): DateDiff {
  let start: Date;
  let end: Date;
  if (d1 <= d2) {
    start = new Date(d1);
    end = new Date(d2);
  } else {
    start = new Date(d2);
    end = new Date(d1);
  }

  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days, totalDays };
}

function formatDateCN(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}年${m}月${d}日`;
}

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
  row: {
    marginBottom: 16,
  },
  resultCard: {
    background: t.inputBg,
    border: `0.5px solid ${t.border}`,
    borderRadius: 8,
    padding: 20,
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: `0.5px solid ${t.border}`,
  },
  resultLabel: {
    color: t.textSecondary,
    fontSize: 14,
  },
  resultValue: {
    color: t.green,
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  resultTitle: {
    color: t.purple,
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16,
  },
  hint: {
    color: t.textHint,
    fontSize: 14,
    textAlign: 'center' as const,
    padding: '40px 0',
  },
  sameDate: {
    color: t.green,
    fontSize: 16,
    textAlign: 'center' as const,
    padding: '20px 0',
  },
  swapHint: {
    color: t.textHint,
    fontSize: 11,
    marginTop: 8,
  },
  dateLabel: {
    color: t.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});

export default function TimeDiff() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');

  const d1 = useMemo(() => {
    if (!date1) return null;
    const d = new Date(date1 + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [date1]);

  const d2 = useMemo(() => {
    if (!date2) return null;
    const d = new Date(date2 + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [date2]);

  const diff = useMemo(() => {
    if (!d1 || !d2) return null;
    return calcDateDiff(d1, d2);
  }, [d1, d2]);

  const isSame = d1 && d2 && d1.getTime() === d2.getTime();
  const isReversed = d1 && d2 && d1.getTime() > d2.getTime();

  const resultText = useMemo(() => {
    if (!diff) return '';
    const parts: string[] = [];
    if (diff.years > 0) parts.push(`${diff.years} 年`);
    if (diff.months > 0) parts.push(`${diff.months} 月`);
    if (diff.days > 0) parts.push(`${diff.days} 天`);
    return parts.join(' ');
  }, [diff]);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={styles.row}>
          <label style={styles.label}>日期一</label>
          <input
            style={styles.input}
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
          />
          {d1 && <div style={styles.dateLabel}>{formatDateCN(d1)}</div>}
        </div>
        <div style={styles.row}>
          <label style={styles.label}>日期二</label>
          <input
            style={styles.input}
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
          />
          {d2 && <div style={styles.dateLabel}>{formatDateCN(d2)}</div>}
        </div>
      </div>

      {(!d1 || !d2) && (
        <div style={styles.hint}>请选择两个日期来计算差值</div>
      )}

      {isSame && d1 && d2 && (
        <div style={styles.section}>
          <div style={styles.sameDate}>两个日期相同，差值为 0 天</div>
        </div>
      )}

      {!isSame && diff && diff.totalDays > 0 && (
        <div style={styles.section}>
          <div style={styles.resultTitle}>
            日期差值
            {isReversed && <span style={{ color: t.textSecondary, fontSize: 12, marginLeft: 8 }}>(已自动交换顺序)</span>}
          </div>
          <div style={styles.resultCard}>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>年 / 月 / 天</span>
              <span style={styles.resultValue}>{resultText}</span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>总天数</span>
              <span style={styles.resultValue}>{diff.totalDays} 天</span>
            </div>
          </div>
          {isReversed && (
            <div style={styles.swapHint}>提示: 日期一 大于 日期二，已自动交换计算差值</div>
          )}
        </div>
      )}
    </div>
  );
}
