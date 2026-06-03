import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../theme';

interface CityTime {
  name: string;
  timezone: string;
  label: string;
}

const CITIES: CityTime[] = [
  { name: '北京', timezone: 'Asia/Shanghai', label: 'UTC+8' },
  { name: '东京', timezone: 'Asia/Tokyo', label: 'UTC+9' },
  { name: '悉尼', timezone: 'Australia/Sydney', label: 'UTC+11' },
  { name: '伦敦', timezone: 'Europe/London', label: 'UTC+1/BST' },
  { name: '纽约', timezone: 'America/New_York', label: 'UTC-4/EST' },
  { name: '洛杉矶', timezone: 'America/Los_Angeles', label: 'UTC-7/PST' },
  { name: '迪拜', timezone: 'Asia/Dubai', label: 'UTC+4' },
  { name: '莫斯科', timezone: 'Europe/Moscow', label: 'UTC+3' },
  { name: '新加坡', timezone: 'Asia/Singapore', label: 'UTC+8' },
  { name: '巴黎', timezone: 'Europe/Paris', label: 'UTC+2/CEST' },
  { name: '首尔', timezone: 'Asia/Seoul', label: 'UTC+9' },
  { name: '孟买', timezone: 'Asia/Kolkata', label: 'UTC+5:30' },
];

function getUTCOffset(date: Date, timezone: string): string {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offsetMs = tzDate.getTime() - utcDate.getTime();
  const offsetMin = Math.round(offsetMs / 60000);
  const hours = Math.floor(Math.abs(offsetMin) / 60);
  const minutes = Math.abs(offsetMin) % 60;
  const sign = offsetMs >= 0 ? '+' : '-';
  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}

const makeStyles = (t: ReturnType<typeof useTheme>): Record<string, React.CSSProperties> => ({
  container: {
    padding: 20,
    fontFamily: "'JetBrains Mono', monospace",
    color: t.text,
    background: t.bg,
    minHeight: '100%',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: t.text,
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: t.green,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: t.green,
    display: 'inline-block',
  },
  cityCard: {
    background: t.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  cityLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  cityName: {
    fontSize: 15,
    fontWeight: 600,
    color: t.text,
  },
  cityDate: {
    fontSize: 11,
    color: t.textHint,
  },
  cityOffset: {
    fontSize: 11,
    color: t.purple,
  },
  cityRight: {
    textAlign: 'right' as const,
  },
  cityTime: {
    fontSize: 22,
    fontWeight: 700,
    color: t.green,
    fontFamily: "'JetBrains Mono', monospace",
  },
});

export default function TimeTimezone() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((date: Date, timezone: string) => {
    return date.toLocaleTimeString('zh-CN', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  const formatDate = useCallback((date: Date, timezone: string) => {
    return date.toLocaleDateString('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.title}>全球时区</span>
        <span style={styles.liveIndicator}>
          <span style={styles.liveDot} /> 实时
        </span>
      </div>
      {CITIES.map((city) => (
        <div key={city.timezone} style={styles.cityCard}>
          <div style={styles.cityLeft}>
            <span style={styles.cityName}>{city.name}</span>
            <span style={styles.cityDate}>{formatDate(now, city.timezone)}</span>
            <span style={styles.cityOffset}>{getUTCOffset(now, city.timezone)}</span>
          </div>
          <div style={styles.cityRight}>
            <div style={styles.cityTime}>{formatTime(now, city.timezone)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
