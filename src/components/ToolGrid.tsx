import { useNavigate } from 'react-router-dom';
import type { ToolMeta } from '../types';
import ToolCard from './ToolCard';

interface ToolGridProps {
  tools: ToolMeta[];
}

export default function ToolGrid({ tools }: ToolGridProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          meta={tool}
          onClick={() => navigate(`/tool/${tool.id}`)}
        />
      ))}
    </div>
  );
}
