import { useState } from 'react';
import { cn } from '@/lib/utils';

const TEMP_UNITS = [
  { symbol: '°C', name: '摄氏度', toFromCelsius: (c: number) => c },
  { symbol: '°F', name: '华氏度', toFromCelsius: (c: number) => c * 9 / 5 + 32 },
  { symbol: 'K', name: '开尔文', toFromCelsius: (c: number) => c + 273.15 },
] as const;

const FROM_CELSIUS: Record<string, (v: number) => number> = {
  '°C': (c: number) => c,
  '°F': (f: number) => (f - 32) * 5 / 9,
  'K': (k: number) => k - 273.15,
};

export default function UnitTemperature() {
  const [value, setValue] = useState('0');
  const [fromUnit, setFromUnit] = useState('°C');

  const numVal = parseFloat(value) || 0;
  const celsiusVal = (FROM_CELSIUS[fromUnit] ?? ((v: number) => v))(numVal);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 h-12 rounded-xl border border-border bg-background px-4 font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="输入温度"
        />
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="w-24 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {TEMP_UNITS.map((u) => (
            <option key={u.symbol} value={u.symbol}>{u.symbol}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TEMP_UNITS.map((u) => {
          const result = u.toFromCelsius(celsiusVal);
          const isActive = u.symbol === fromUnit;
          return (
            <div
              key={u.symbol}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-4 py-4 transition-all',
                isActive
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card hover:border-ring/30',
              )}
            >
              <span className="text-xs text-muted-foreground">{u.name}</span>
              <span className="font-mono text-xl font-bold text-foreground tabular-nums">
                {result.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-1">{u.symbol}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
