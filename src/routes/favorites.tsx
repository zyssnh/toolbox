import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { toolMetas } from '@/registry';

function FavoritesPage() {
  const favorites = useAppStore((s) => s.favorites);
  const favTools = toolMetas.filter((t) => favorites.includes(t.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/" search={{}}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-ring/50 transition-all no-underline"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" fill="currentColor" />
          我的收藏
        </h1>
      </div>

      {favTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-base font-medium text-foreground mb-2">暂无收藏</p>
          <p className="text-sm text-muted-foreground mb-6">
            在工具页面点击收藏按钮即可添加到这里
          </p>
          <Link
            to="/" search={{}}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity no-underline"
          >
            浏览工具
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {favTools.map((tool) => (
            <Link
              key={tool.id}
              to="/tool/$id"
              params={{ id: tool.id }}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
            >
              <span className="text-2xl">{tool.icon}</span>
              <div>
                <div className="font-medium text-sm text-card-foreground">{tool.name}</div>
                <p className="text-xs text-muted-foreground line-clamp-1">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
});
