import { useTheme } from '../theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useTheme();

  return (
    <div style={{ position: 'relative', width: 300 }}>
      <span
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 14,
          color: t.textHint,
          pointerEvents: 'none',
        }}
      >
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索工具..."
        style={{
          width: '100%',
          background: t.inputBg,
          border: `0.5px solid ${t.border}`,
          borderRadius: 20,
          padding: '8px 16px 8px 36px',
          color: t.text,
          fontSize: 14,
          outline: 'none',
          fontFamily: "'Noto Sans SC', sans-serif",
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = t.primary;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = t.border;
        }}
      />
    </div>
  );
}
