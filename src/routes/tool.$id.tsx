import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Suspense, useEffect } from 'react';
import { ArrowLeft, Heart, ExternalLink } from 'lucide-react';
import { toolMetas, toolComponents, categories } from '@/registry';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

function ToolPage() {
  const { id } = Route.useParams();
  const meta = toolMetas.find((t) => t.id === id);
  const Component = toolComponents[id as keyof typeof toolComponents];
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addRecent = useAppStore((s) => s.addRecent);
  const isFav = favorites.includes(id);
  const cat = categories.find((c) => c.id === meta?.category);

  useEffect(() => {
    addRecent(id);
  }, [id, addRecent]);

  if (!meta || !Component) {
    throw notFound();
  }

  const gameId = meta.id.replace('game-', '');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Breadcrumb + meta */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-ring/50 transition-all no-underline"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>

        <span className="text-2xl">{meta.icon}</span>
        <h1 className="text-xl font-semibold text-foreground">{meta.name}</h1>

        {cat && (
          <span className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
            {cat.icon} {cat.label}
          </span>
        )}

        <button
          onClick={() => toggleFavorite(meta.id)}
          className={cn(
            'ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors',
            isFav
              ? 'bg-accent/10 text-accent'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} />
          {isFav ? '已收藏' : '收藏'}
        </button>

        {meta.category === 'game' && (
          <Link
            to="/game/$gameId"
            params={{ gameId }}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20 transition-colors no-underline"
          >
            <ExternalLink className="h-4 w-4" />
            全屏游玩
          </Link>
        )}
      </div>

      {/* Tool content */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Suspense
          fallback={
            <div className="p-8 space-y-4">
              <div className="h-5 w-1/3 rounded bg-muted animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
              <div className="h-48 rounded bg-muted animate-pulse" />
            </div>
          }
        >
          <div className="p-6">
            <Component />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/tool/$id')({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">404</span>
      <p className="text-lg font-medium text-foreground mb-2">工具未找到</p>
      <p className="text-sm text-muted-foreground mb-6">该工具可能已被移除或链接无效</p>
      <Link
        to="/"
        className="text-primary hover:underline text-sm"
      >
        返回首页
      </Link>
    </div>
  ),
});
