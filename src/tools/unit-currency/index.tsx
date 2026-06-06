import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const RATES: Record<string, number> = {
  CNY: 1,
  USD: 0.138,
  EUR: 0.128,
  JPY: 20.8,
  GBP: 0.109,
  HKD: 1.08,
  KRW: 185.5,
  AUD: 0.212,
  CAD: 0.189,
  SGD: 0.186,
  CHF: 0.122,
  RUB: 12.6,
};

export default function UnitCurrency() {
  const [value, setValue] = useState('100');
  const [fromCur, setFromCur] = useState('CNY');
  const [toCur, setToCur] = useState('USD');

  const numVal = parseFloat(value) || 0;
  const cnyVal = numVal / (RATES[fromCur] ?? 1);
  const result = cnyVal * (RATES[toCur] ?? 1);

  const swap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
  };

  const currencies = Object.keys(RATES);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs text-muted-foreground">从</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 h-12 rounded-xl border border-border bg-background px-4 font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={fromCur}
              onChange={(e) => setFromCur(e.target.value)}
              className="w-24 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={swap}
          className="h-12 w-12 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary active:scale-95 transition-all"
        >
          <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex-1 space-y-1.5">
          <label className="text-xs text-muted-foreground">到</label>
          <div className="flex gap-2">
            <div className="flex-1 h-12 rounded-xl border border-border bg-muted/50 px-4 flex items-center font-mono text-lg text-foreground">
              {result.toFixed(2)}
            </div>
            <select
              value={toCur}
              onChange={(e) => setToCur(e.target.value)}
              className="w-24 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        参考汇率，非实时数据
      </p>
    </div>
  );
}
