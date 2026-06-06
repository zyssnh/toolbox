import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ToolLayoutProps {
  children: ReactNode;
  className?: string;
}

/** Consistent wrapper for all tool components */
export function ToolLayout({ children, className }: ToolLayoutProps) {
  return (
    <div className={cn('space-y-5', className)}>
      {children}
    </div>
  );
}
