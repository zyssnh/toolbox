import React, { useState } from 'react';

const units: { key: string; label: string; toGrams: number }[] = [
  { key: 'kg', label: '千克 (kg)', toGrams: 1000 },
  { key: 'g', label: '克 (g)', toGrams: 1 },
  { key: 'mg', label: '毫克 (mg)', toGrams: 0.001 },
  { key: 'ton', label: '吨 (t)', toGrams: 1000000 },
  { key: 'lb', label: '磅 (lb)', toGrams: 453.59237 },
  { key: 'oz', label: '盎司 (oz)', toGrams: 28.349523125 },
  { key: 'jin', label: '斤', toGrams: 500 },
  { key: 'liang', label: '两', toGrams: 50 },
];

const UnitWeight: React.FC = () => {
  const [value, setValue] = useState<string>('1');
  const [unit, setUnit] = useState<string>('kg');

  const numValue = parseFloat(value) || 0;
  const selected = units.find((u) => u.key === unit)!;
  const grams = numValue * selected.toGrams;

  const styles = {
    wrapper: {
      padding: 20,
      fontFamily: "'Noto Sans SC', sans-serif",
      background: '#0F0F11',
      minHeight: '100%',
      color: '#E0E0E8',
    } as React.CSSProperties,
    title: {
      color: '#E0E0E8',
      fontSize: 16,
      fontWeight: 500,
      marginBottom: 20,
    } as React.CSSProperties,
    inputRow: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      marginBottom: 24,
      flexWrap: 'wrap',
    } as React.CSSProperties,
    label: {
      color: '#888890',
      fontSize: 13,
      marginBottom: 4,
    } as React.CSSProperties,
    input: {
      background: '#0F0F11',
      border: '0.5px solid #2a2a30',
      borderRadius: 6,
      padding: '8px 12px',
      color: '#E0E0E8',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 15,
      width: 180,
      outline: 'none',
    } as React.CSSProperties,
    select: {
      background: '#0F0F11',
      border: '0.5px solid #2a2a30',
      borderRadius: 6,
      padding: '8px 12px',
      color: '#E0E0E8',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
    } as React.CSSProperties,
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 12,
    } as React.CSSProperties,
    card: {
      background: '#141418',
      border: '0.5px solid #2a2a30',
      borderRadius: 8,
      padding: 16,
    } as React.CSSProperties,
    cardUnit: {
      color: '#888890',
      fontSize: 12,
      marginBottom: 8,
    } as React.CSSProperties,
    cardValue: {
      fontFamily: "'JetBrains Mono', monospace",
      color: '#39D98A',
      fontSize: 18,
      wordBreak: 'break-all',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.title}>重量换算</div>

      <div style={styles.label}>数值</div>
      <div style={styles.inputRow}>
        <input
          type="number"
          style={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入数值"
        />
        <select
          style={styles.select}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          {units.map((u) => (
            <option key={u.key} value={u.key}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.grid}>
        {units.map((u) => {
          const converted = grams / u.toGrams;
          return (
            <div key={u.key} style={styles.card}>
              <div style={styles.cardUnit}>{u.label}</div>
              <div style={styles.cardValue}>
                {converted.toFixed(6)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnitWeight;
