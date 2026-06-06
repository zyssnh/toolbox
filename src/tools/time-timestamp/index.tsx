import { useState } from 'react';
import { CopyButton } from '@/components/shared/CopyButton';

function toLocalISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TimeTimestamp() {
  const now = Math.floor(Date.now() / 1000);
  const [tsInput, setTsInput] = useState(String(now));
  const [dtInput, setDtInput] = useState(toLocalISO(new Date()));

  const ts = parseInt(tsInput) || 0;
  const tsDate = new Date(ts * 1000);
  const isValidTs = ts > 0;

  const dtDate = new Date(dtInput);
  const isValidDt = !isNaN(dtDate.getTime());
  const dtTs = Math.floor(dtDate.getTime() / 1000);

  return (
    <div className="space-y-6">
      {/* Timestamp → Date */}
      <section className="space-y-3">
        <p className="text-sm font-medium text-foreground">Unix 时间戳 → 日期时间</p>
        <input
          type="number"
          value={tsInput}
          onChange={(e) => setTsInput(e.target.value)}
          placeholder="输入 Unix 时间戳（秒）"
          className="w-full h-11 rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {isValidTs && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">UTC</p>
              <p className="font-mono text-sm text-foreground">
                {tsDate.toUTCString()}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">本地</p>
              <p className="font-mono text-sm text-foreground">
                {tsDate.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </section>

      <hr className="border-border" />

      {/* Date → Timestamp */}
      <section className="space-y-3">
        <p className="text-sm font-medium text-foreground">日期时间 → Unix 时间戳</p>
        <input
          type="datetime-local"
          value={dtInput}
          onChange={(e) => setDtInput(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {isValidDt && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
            <span className="font-mono text-lg text-foreground">{dtTs}</span>
            <CopyButton text={String(dtTs)} />
          </div>
        )}
      </section>
    </div>
  );
}
