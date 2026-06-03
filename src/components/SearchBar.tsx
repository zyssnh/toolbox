interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', width: 300 }}>
      <span
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 14,
          color: '#55555F',
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
          background: '#0F0F11',
          border: '0.5px solid #2a2a30',
          borderRadius: 20,
          padding: '8px 16px 8px 36px',
          color: '#E0E0E8',
          fontSize: 14,
          outline: 'none',
          fontFamily: "'Noto Sans SC', sans-serif",
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#4F8EF7';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#2a2a30';
        }}
      />
    </div>
  );
}
