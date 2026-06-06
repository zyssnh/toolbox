import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toolMetas, toolComponents } from '@/registry';

function GamePage() {
  const { gameId } = Route.useParams();
  const toolId = `game-${gameId}`;
  const meta = toolMetas.find((m) => m.id === toolId);
  const Component = toolComponents[toolId as keyof typeof toolComponents];

  if (!meta || !Component) {
    throw notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center px-4 h-12 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          工具箱
        </Link>
        <div className="flex-1 text-center">
          <span className="text-base font-medium text-foreground">
            {meta.icon} {meta.name}
          </span>
        </div>
        <div className="w-16" />
      </div>

      {/* Game area */}
      <div className="flex-1 flex">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="h-6 w-24 rounded bg-muted animate-pulse" />
            </div>
          }
        >
          <Component />
        </Suspense>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/game/$gameId')({
  component: GamePage,
});
