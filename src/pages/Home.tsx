import { useState, useMemo } from 'react';
import { useSearch } from '../components/Layout';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ToolGrid from '../components/ToolGrid';
import RecentBar from '../components/RecentBar';
import { toolMetas, categories } from '../registry';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme';
import type { ToolMeta, Category } from '../types';

const categoryColors: Record<Category, string> = {
  unit: '#4F8EF7',
  time: '#a78bfa',
  text: '#39D98A',
  dev: '#f59e0b',
  game: '#ec4899',
  image: '#ec4899',
  math: '#a78bfa',
};

const categoryLabelMap: Record<string, string> = {};
categories.forEach((c) => {
  categoryLabelMap[c.id] = c.label;
});

export default function Home() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [activeCategory, setActiveCategory] = useState('all');
  const recentTools = useAppStore((s) => s.recentTools);
  const t = useTheme();

  const recentToolMetas = useMemo(() => {
    const idSet = new Set(recentTools);
    return toolMetas.filter((t) => idSet.has(t.id));
  }, [recentTools]);

  const filtered = useMemo(() => {
    return toolMetas.filter((tool) => {
      if (activeCategory !== 'all' && tool.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const isSearching = searchQuery.length > 0;

  const grouped = useMemo(() => {
    if (isSearching || activeCategory !== 'all') return null;
    const map: Record<string, ToolMeta[]> = {};
    filtered.forEach((tool) => {
      if (!map[tool.category]) map[tool.category] = [];
      map[tool.category].push(tool);
    });
    return map;
  }, [filtered, isSearching, activeCategory]);

  return (
    <div>
      {/* Hero section */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 32,
            color: t.text,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {'// 在线工具箱'}
        </h1>
        <p style={{ color: t.textSecondary, fontSize: 15, marginBottom: 6 }}>
          无需安装，离线可用的开源工具集合
        </p>
        <p style={{ color: t.textHint, fontSize: 13, marginBottom: 20 }}>
          {toolMetas.length} 个工具 · {categories.length - 1} 个分类
        </p>
        <p style={{ color: t.textHint, fontSize: 12, marginBottom: 24 }}>
          支持 PWA 安装，可离线使用
        </p>
        <div
          style={{
            maxWidth: 400,
            margin: '0 auto 24px',
          }}
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Recent tools */}
      <RecentBar tools={recentToolMetas} />

      {/* Results */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: t.textSecondary,
            fontSize: 15,
            padding: '60px 0',
          }}
        >
          没有找到匹配的工具
        </div>
      ) : isSearching || activeCategory !== 'all' ? (
        <ToolGrid tools={filtered} />
      ) : (
        grouped &&
        Object.entries(grouped).map(([catId, tools]) => (
          <div key={catId} style={{ marginBottom: 32 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: categoryColors[catId as Category] || '#4F8EF7',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: t.text,
                }}
              >
                {categoryLabelMap[catId] || catId}
              </span>
              <span style={{ color: t.textHint, fontSize: 13 }}>
                ({tools.length})
              </span>
            </div>
            <ToolGrid tools={tools} />
          </div>
        ))
      )}
    </div>
  );
}
