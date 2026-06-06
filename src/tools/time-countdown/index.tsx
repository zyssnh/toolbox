import { useState, useEffect } from 'react';

function calcRemaining(target: Date, _now: number) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true as const };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false as const,
  };
}

export default function TimeCountdown() {
  const defaultTarget = new Date();
  defaultTarget.setHours(defaultTarget.getHours() + 1);
  const [title, setTitle] = useState('');
  const [targetStr, setTargetStr] = useState(defaultTarget.toISOString().slice(0, 16));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetStr);
  const { days, hours, minutes, seconds, expired } = calcRemaining(target, now);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="倒计时标题（可选）"
          className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="datetime-local"
          value={targetStr}
          onChange={(e) => setTargetStr(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {title && <p className="text-center text-base text-foreground font-medium">{title}</p>}

      {expired ? (
        <div className="text-center py-8 text-lg text-muted-foreground">
          倒计时已结束
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: days, label: '天' },
            { value: hours, label: '时' },
            { value: minutes, label: '分' },
            { value: seconds, label: '秒' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <span className="text-3xl font-bold text-foreground tabular-nums font-mono">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
