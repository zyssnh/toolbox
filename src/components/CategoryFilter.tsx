import { categories } from '../registry';
import { useTheme } from '../theme';

interface CategoryFilterProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const t = useTheme();

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
              border: isActive ? 'none' : `0.5px solid ${t.border}`,
              background: isActive ? t.primary : t.card,
              color: isActive ? '#fff' : t.textSecondary,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: "'Noto Sans SC', sans-serif",
              transition: 'border-color 200ms, background 200ms, color 200ms',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = t.borderHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = t.border;
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
