import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../theme';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcRemaining(target: Date, now: Date): TimeRemaining {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, total };
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
  cardRow: {
    display: 'flex',
    gap: 12,
    marginTop: 20,
  },
  timeCard: {
    flex: 1,
    background: t.inputBg,
    border: `0.5px solid ${t.border}`,
    borderRadius: 8,
    padding: '16px 8px',
    textAlign: 'center' as const,
  },
  timeNumber: {
    fontSize: 36,
    fontWeight: 700,
    color: t.green,
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1.2,
  },
  timeLabel: {
    fontSize: 13,
    color: t.textSecondary,
    marginTop: 4,
  },
  hint: {
    color: t.textHint,
    fontSize: 14,
    textAlign: 'center' as const,
    padding: '40px 0',
  },
  finished: {
    color: t.green,
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center' as const,
    padding: '40px 0',
  },
  titleDisplay: {
    color: t.purple,
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
});

export default function TimeCountdown() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  const [targetDate, setTargetDate] = useState('');
  const [title, setTitle] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const target = useMemo(() => {
    if (!targetDate) return null;
    const d = new Date(targetDate);
    return isNaN(d.getTime()) ? null : d;
  }, [targetDate]);

  const remaining = useMemo(() => {
    if (!target) return null;
    return calcRemaining(target, now);
  }, [target, now]);

  const isFinished = remaining !== null && remaining.total <= 0;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={styles.row}>
          <label style={styles.label}>倒计时标题（可选）</label>
          <input
            style={styles.input}
            type="text"
            placeholder="例如: 新年倒计时"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div style={styles.row}>
          <label style={styles.label}>目标日期时间</label>
          <input
            style={styles.input}
            type="datetime-local"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
      </div>

      {!target && (
        <div style={styles.hint}>请选择目标日期和时间开始倒计时</div>
      )}

      {isFinished && target && (
        <div style={styles.section}>
          {title && <div style={styles.titleDisplay}>{title}</div>}
          <div style={styles.finished}>倒计时结束!</div>
        </div>
      )}

      {remaining && !isFinished && (
        <div style={styles.section}>
          {title && <div style={styles.titleDisplay}>{title}</div>}
          <div style={styles.cardRow}>
            <div style={styles.timeCard}>
              <div style={styles.timeNumber}>{pad(remaining.days)}</div>
              <div style={styles.timeLabel}>天</div>
            </div>
            <div style={styles.timeCard}>
              <div style={styles.timeNumber}>{pad(remaining.hours)}</div>
              <div style={styles.timeLabel}>时</div>
            </div>
            <div style={styles.timeCard}>
              <div style={styles.timeNumber}>{pad(remaining.minutes)}</div>
              <div style={styles.timeLabel}>分</div>
            </div>
            <div style={styles.timeCard}>
              <div style={styles.timeNumber}>{pad(remaining.seconds)}</div>
              <div style={styles.timeLabel}>秒</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
