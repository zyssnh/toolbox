import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UnitDef {
  symbol: string;
  name: string;
  toBase: number; // multiplier to convert to base unit
}

interface UnitConverterProps {
  units: UnitDef[];
  decimals?: number;
}

export function UnitConverter({ units, decimals = 6 }: UnitConverterProps) {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState(units[0]?.symbol ?? '');

  const fromDef = units.find((u) => u.symbol === fromUnit);
  const numVal = parseFloat(value) || 0;
  const baseVal = fromDef ? numVal * fromDef.toBase : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 h-12 rounded-xl border border-border bg-background px-4 font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="输入数值"
        />
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="w-28 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {units.map((u) => (
            <option key={u.symbol} value={u.symbol}>{u.symbol}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {units.map((u) => {
          const result = baseVal / u.toBase;
          const isActive = u.symbol === fromUnit;
          return (
            <div
              key={u.symbol}
              className={cn(
                'flex items-center justify-between rounded-xl border px-4 py-3 transition-all',
                isActive
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card hover:border-ring/30',
              )}
            >
              <span className="text-xs text-muted-foreground">
                {u.name} <span className="font-mono text-muted-foreground/60 ml-1">{u.symbol}</span>
              </span>
              <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                {result.toFixed(decimals)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
