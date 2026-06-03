import { categories } from '../registry';

interface CategoryFilterProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {categories.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: isActive ? 'none' : '0.5px solid #2a2a30',
              background: isActive ? '#4F8EF7' : '#141418',
              color: isActive ? '#fff' : '#888890',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: "'Noto Sans SC', sans-serif",
              transition: 'border-color 200ms, background 200ms, color 200ms',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a48';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a30';
              }
            }}
          >
            {cat.icon} {cat.label}
          </button>
        );
      })}
    </div>
  );
}
