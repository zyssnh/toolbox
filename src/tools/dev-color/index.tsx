import React, { useState, useEffect } from 'react';

/* ---------- Color helpers ---------- */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b))
    .toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break;
      case ng: h = ((nb - nr) / d + 2) / 6; break;
      case nb: h = ((nr - ng) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const nh = h / 360, ns = s / 100, nl = l / 100;
  let r = 0, g = 0, b = 0;
  if (ns === 0) {
    r = g = b = nl;
  } else {
    function hue2rgb(p: number, q: number, t: number): number {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    const q = nl < 0.5 ? nl * (1 + ns) : nl + ns - nl * ns;
    const p = 2 * nl - q;
    r = hue2rgb(p, q, nh + 1 / 3);
    g = hue2rgb(p, q, nh);
    b = hue2rgb(p, q, nh - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/* ---------- Styles ---------- */
const st: Record<string, React.CSSProperties> = {
  container: { padding: 20 },
  section: { marginBottom: 20 },
  label: { color: '#888890', fontSize: 13, marginBottom: 6 },
  inputRow: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  input: {
    background: '#0F0F11',
    border: '0.5px solid #2a2a30',
    borderRadius: 6,
    padding: '8px 12px',
    color: '#E0E0E8',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    outline: 'none',
  },
  hexInput: { width: 140 },
  rgbInput: { width: 64 },
  hslInput: { width: 70 },
  inputHint: { color: '#888890', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
  preview: {
    borderRadius: 8,
    marginTop: 16,
    height: 140,
    width: '100%',
    border: '0.5px solid #2a2a30',
    transition: 'background 0.2s',
  },
  error: { color: '#f59e0b', fontSize: 12, marginTop: 4 },
};

export default function DevColor() {
  // HEX
  const [hex, setHex] = useState('#4F8EF7');
  // RGB
  const [r, setR] = useState(79);
  const [g, setG] = useState(142);
  const [b, setB] = useState(247);
  // HSL
  const [h, setH] = useState(217);
  const [sl, setSl] = useState(91);
  const [l, setL] = useState(64);

  const [activeSource, setActiveSource] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setError('');
      if (activeSource === 'hex') {
        const rgb = hexToRgb(hex);
        if (!rgb) {
          if (hex.length >= 7) setError('无效的 HEX 值');
          return;
        }
        setR(rgb.r); setG(rgb.g); setB(rgb.b);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setH(hsl.h); setSl(hsl.s); setL(hsl.l);
      } else if (activeSource === 'rgb') {
        const hexVal = rgbToHex(r, g, b);
        setHex(hexVal);
        const hsl = rgbToHsl(r, g, b);
        setH(hsl.h); setSl(hsl.s); setL(hsl.l);
      } else if (activeSource === 'hsl') {
        const rgb = hslToRgb(h, sl, l);
        setR(rgb.r); setG(rgb.g); setB(rgb.b);
        setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
    } catch {
      setError('转换出错');
    }
  }, [hex, r, g, b, h, sl, l, activeSource]);

  const clampNum = (v: number, min: number, max: number) =>
    isNaN(v) ? min : Math.max(min, Math.min(max, v));

  return (
    <div style={st.container}>
      {/* HEX Input */}
      <div style={st.section}>
        <div style={st.label}>HEX</div>
        <div style={st.inputRow}>
          <span style={st.inputHint}>#</span>
          <input
            style={{ ...st.input, ...st.hexInput }}
            value={hex.replace(/^#/, '')}
            maxLength={6}
            placeholder="4F8EF7"
            onFocus={() => setActiveSource('hex')}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
              setHex('#' + val.toUpperCase());
              setActiveSource('hex');
            }}
          />
          <span style={{ ...st.inputHint, color: hexToRgb(hex) ? '#39D98A' : '#f59e0b' }}>
            {hexToRgb(hex) ? '✓' : hex.length >= 7 ? '✗' : ''}
          </span>
        </div>
      </div>

      {/* RGB Input */}
      <div style={st.section}>
        <div style={st.label}>RGB</div>
        <div style={st.inputRow}>
          <input
            style={{ ...st.input, ...st.rgbInput }}
            type="number"
            min={0} max={255}
            value={r}
            onFocus={() => setActiveSource('rgb')}
            onChange={(e) => { setR(clampNum(Number(e.target.value), 0, 255)); setActiveSource('rgb'); }}
          />
          <input
            style={{ ...st.input, ...st.rgbInput }}
            type="number"
            min={0} max={255}
            value={g}
            onFocus={() => setActiveSource('rgb')}
            onChange={(e) => { setG(clampNum(Number(e.target.value), 0, 255)); setActiveSource('rgb'); }}
          />
          <input
            style={{ ...st.input, ...st.rgbInput }}
            type="number"
            min={0} max={255}
            value={b}
            onFocus={() => setActiveSource('rgb')}
            onChange={(e) => { setB(clampNum(Number(e.target.value), 0, 255)); setActiveSource('rgb'); }}
          />
        </div>
      </div>

      {/* HSL Input */}
      <div style={st.section}>
        <div style={st.label}>HSL</div>
        <div style={st.inputRow}>
          <input
            style={{ ...st.input, ...st.hslInput }}
            type="number"
            min={0} max={360}
            value={h}
            onFocus={() => setActiveSource('hsl')}
            onChange={(e) => { setH(clampNum(Number(e.target.value), 0, 360)); setActiveSource('hsl'); }}
          />
          <input
            style={{ ...st.input, ...st.hslInput }}
            type="number"
            min={0} max={100}
            value={sl}
            onFocus={() => setActiveSource('hsl')}
            onChange={(e) => { setSl(clampNum(Number(e.target.value), 0, 100)); setActiveSource('hsl'); }}
          />
          <input
            style={{ ...st.input, ...st.hslInput }}
            type="number"
            min={0} max={100}
            value={l}
            onFocus={() => setActiveSource('hsl')}
            onChange={(e) => { setL(clampNum(Number(e.target.value), 0, 100)); setActiveSource('hsl'); }}
          />
        </div>
      </div>

      {error && <div style={st.error}>{error}</div>}

      {/* Color Preview */}
      <div
        style={{
          ...st.preview,
          background: hexToRgb(hex) ? hex : '#141418',
        }}
      />
    </div>
  );
}
