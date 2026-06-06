import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Heart, Clock, Wrench, Gamepad2 } from 'lucide-react';
import { toolMetas, categories } from '@/registry';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const favorites = useAppStore((s) => s.favorites);
  const recentTools = useAppStore((s) => s.recentTools);
  const addRecent = useAppStore((s) => s.addRecent);

  const filtered = useMemo(() => {
    let list = toolMetas;
    if (activeCategory !== 'all') {
      list = list.filter((t) => t.category === activeCategory);
    }
    return list;
  }, [activeCategory]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof toolMetas> = {};
    for (const t of filtered) {
      (map[t.category] ??= []).push(t);
    }
    return map;
  }, [filtered]);

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1.5 tracking-tight">
          在线工具箱
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          精选开发工具集合，离线可用，数据本地存储
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Recent tools */}
      {recentTools.length > 0 && activeCategory === 'all' && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> 最近使用
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {recentTools.slice(0, 6).map((id) => {
              const meta = toolMetas.find((m) => m.id === id);
              if (!meta) return null;
              return (
                <Link
                  key={id}
                  to="/tool/$id"
                  params={{ id: meta.id }}
                  onClick={() => addRecent(meta.id)}
                  className="flex items-center gap-1.5 shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-secondary transition-colors no-underline"
                >
                  <span className="text-base">{meta.icon}</span>
                  {meta.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tool grid grouped by category */}
      {Object.entries(grouped).map(([catId, tools]) => {
        const cat = catMap.get(catId as (typeof categories)[number]['id']);
        if (!cat) return null;
        return (
          <section key={catId} className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              {cat.id === 'game' ? (
                <Gamepad2 className="h-4 w-4" />
              ) : (
                <Wrench className="h-4 w-4" />
              )}
              {cat.label}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
              {tools.map((tool) => {
                const isFav = favorites.includes(tool.id);
                return (
                  <Link
                    key={tool.id}
                    to="/tool/$id"
                    params={{ id: tool.id }}
                    onClick={() => addRecent(tool.id)}
                    className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{tool.icon}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          useAppStore.getState().toggleFavorite(tool.id);
                        }}
                        className={cn(
                          'shrink-0 transition-colors',
                          isFav
                            ? 'text-accent'
                            : 'text-muted-foreground/40 hover:text-muted-foreground',
                        )}
                      >
                        <Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-card-foreground">
                          {tool.name}
                        </span>
                        {tool.isNew && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            NEW
                          </span>
                        )}
                        {tool.isHot && (
                          <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                            HOT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">没有找到匹配的工具</p>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
});
