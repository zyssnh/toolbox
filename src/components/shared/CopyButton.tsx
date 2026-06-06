import { useCopyToClipboard } from '@uidotdev/usehooks';
import { Check, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copiedText, copy] = useCopyToClipboard();
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    if (copiedText) {
      setJustCopied(true);
      const t = setTimeout(() => setJustCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copiedText]);

  return (
    <button
      onClick={() => copy(text)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
        'border border-border bg-card text-muted-foreground hover:text-foreground hover:border-ring/50',
        'active:scale-95',
        justCopied && 'border-success/50 text-success bg-success/5',
        className,
      )}
    >
      {justCopied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          已复制
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          复制
        </>
      )}
    </button>
  );
}
