import { useState, useEffect } from 'react';
import chroma from 'chroma-js';
import { CopyButton } from '@/components/shared/CopyButton';

export default function DevColor() {
  const [hex, setHex] = useState('#4F8EF7');
  const [rgb, setRgb] = useState({ r: 79, g: 142, b: 247 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 64 });
  const [source, setSource] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  const updateFromHex = (h: string) => {
    try {
      const c = chroma(h);
      const [rr, gg, bb] = c.rgb();
      const [hh, ss, ll] = c.hsl();
      setRgb({ r: rr, g: gg, b: bb });
      setHsl({ h: Math.round(hh || 0), s: Math.round(ss * 100), l: Math.round(ll * 100) });
    } catch { /* invalid color */ }
  };

  const updateFromRgb = (r: number, g: number, b: number) => {
    try {
      const c = chroma(r, g, b);
      setHex(c.hex());
      const [hh, ss, ll] = c.hsl();
      setHsl({ h: Math.round(hh || 0), s: Math.round(ss * 100), l: Math.round(ll * 100) });
    } catch { /* invalid */ }
  };

  const updateFromHsl = (h: number, s: number, l: number) => {
    try {
      const c = chroma.hsl(h, s / 100, l / 100);
      setHex(c.hex());
      const [rr, gg, bb] = c.rgb();
      setRgb({ r: rr, g: gg, b: bb });
    } catch { /* invalid */ }
  };

  useEffect(() => {
    if (source === 'hex') updateFromHex(hex);
  }, [hex, source]);

  const colorValid = (() => { try { chroma(hex); return true; } catch { return false; } })();

  return (
    <div className="space-y-5">
      {/* Color preview */}
      <div
        className="h-24 rounded-2xl border border-border transition-all duration-300"
        style={{ background: colorValid ? hex : 'transparent' }}
      />

      {/* HEX */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">HEX</label>
        <div className="flex gap-2">
          <input
            value={hex}
            onChange={(e) => { setHex(e.target.value); setSource('hex'); }}
            placeholder="#000000"
            className="flex-1 h-10 rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <CopyButton text={hex} />
        </div>
      </div>

      {/* RGB */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">RGB</label>
        <div className="flex gap-2">
          {['r', 'g', 'b'].map((ch) => (
            <div key={ch} className="flex-1 flex items-center gap-1">
              <span className="text-xs text-muted-foreground uppercase">{ch}</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb[ch as keyof typeof rgb]}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(255, +e.target.value || 0));
                  const newRgb = { ...rgb, [ch]: v };
                  setRgb(newRgb);
                  setSource('rgb');
                  updateFromRgb(newRgb.r, newRgb.g, newRgb.b);
                }}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>

      {/* HSL */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">HSL</label>
        <div className="flex gap-2">
          {[
            { key: 'h', max: 360, suffix: '°' },
            { key: 's', max: 100, suffix: '%' },
            { key: 'l', max: 100, suffix: '%' },
          ].map(({ key, max, suffix }) => (
            <div key={key} className="flex-1 flex items-center gap-1">
              <span className="text-xs text-muted-foreground uppercase">{key}</span>
              <input
                type="number"
                min={0}
                max={max}
                value={hsl[key as keyof typeof hsl]}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(max, +e.target.value || 0));
                  const newHsl = { ...hsl, [key]: v };
                  setHsl(newHsl);
                  setSource('hsl');
                  updateFromHsl(newHsl.h, newHsl.s, newHsl.l);
                }}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">{suffix}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
