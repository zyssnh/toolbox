import { useState, useMemo } from 'react';

export default function TimeDiff() {
  const today = new Date().toISOString().slice(0, 10);
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(today);

  const diff = useMemo(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const [earlier, later] = d1 <= d2 ? [d1, d2] : [d2, d1];
    const msDiff = later.getTime() - earlier.getTime();
    const totalDays = Math.floor(msDiff / 86400000);
    const years = later.getFullYear() - earlier.getFullYear();
    const months = later.getMonth() - earlier.getMonth() + years * 12;
    const days = Math.floor((msDiff % 86400000) / 3600000);

    return { earlier, later, totalDays, months, days };
  }, [date1, date2]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">日期 1</label>
          <input
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="w-full h-11 rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">日期 2</label>
          <input
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="w-full h-11 rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {diff && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '相差天数', value: diff.totalDays },
            { label: '相差月数', value: diff.months },
            { label: '总天数', value: diff.totalDays },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
