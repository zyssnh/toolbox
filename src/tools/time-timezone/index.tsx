import { useState } from 'react';
import { useEffect } from 'react';

const ZONES: { city: string; timezone: string; flag: string }[] = [
  { city: '北京', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: '东京', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: '首尔', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { city: '悉尼', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { city: '迪拜', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: '伦敦', timezone: 'Europe/London', flag: '🇬🇧' },
  { city: '巴黎', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { city: '纽约', timezone: 'America/New_York', flag: '🇺🇸' },
  { city: '洛杉矶', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: '圣保罗', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { city: '莫斯科', timezone: 'Europe/Moscow', flag: '🇷🇺' },
  { city: '新加坡', timezone: 'Asia/Singapore', flag: '🇸🇬' },
];

export default function TimeTimezone() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatter = (tz: string) =>
    new Intl.DateTimeFormat('zh-CN', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);

  const offset = (tz: string) => {
    const d = new Date(now);
    const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(d.toLocaleString('en-US', { timeZone: tz }));
    return `UTC${(local.getTime() - utc.getTime()) / 3600000 >= 0 ? '+' : ''}${(local.getTime() - utc.getTime()) / 3600000}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {ZONES.map((z) => (
        <div
          key={z.city}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:border-ring/30 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{z.flag}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{z.city}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{offset(z.timezone)}</p>
            </div>
          </div>
          <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
            {formatter(z.timezone).slice(-8)}
          </span>
        </div>
      ))}
    </div>
  );
}
