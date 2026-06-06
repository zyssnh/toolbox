import { useState, useMemo } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { CopyButton } from '@/components/shared/CopyButton';
import { cn } from '@/lib/utils';

type CaseStyle = 'camel' | 'pascal' | 'snake' | 'upperSnake' | 'kebab' | 'upper' | 'lower' | 'title';

const CASE_OPTIONS: { id: CaseStyle; label: string; example: string }[] = [
  { id: 'camel', label: 'camelCase', example: 'helloWorld' },
  { id: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { id: 'snake', label: 'snake_case', example: 'hello_world' },
  { id: 'upperSnake', label: 'UPPER_SNAKE', example: 'HELLO_WORLD' },
  { id: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { id: 'upper', label: 'UPPER CASE', example: 'HELLO WORLD' },
  { id: 'lower', label: 'lower case', example: 'hello world' },
  { id: 'title', label: 'Title Case', example: 'Hello World' },
];

function tokenize(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

const transformers: Record<CaseStyle, (tokens: string[]) => string> = {
  camel: (t) => t.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(''),
  pascal: (t) => t.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
  snake: (t) => t.join('_'),
  upperSnake: (t) => t.map((w) => w.toUpperCase()).join('_'),
  kebab: (t) => t.join('-'),
  upper: (t) => t.map((w) => w.toUpperCase()).join(' '),
  lower: (t) => t.join(' '),
  title: (t) => t.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
};

export default function TextCase() {
  const [text, setText] = useState('');
  const [activeCase, setActiveCase] = useState<CaseStyle>('camel');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tokens = useMemo(() => tokenize(text), [text]);
  const result = useMemo(() => {
    if (!text.trim() || tokens.length === 0) return '';
    return transformers[activeCase](tokens);
  }, [tokens, activeCase]);

  const active = CASE_OPTIONS.find((c) => c.id === activeCase);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入英文文本..."
        rows={4}
        className="w-full rounded-xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:border-ring/50 transition-colors"
        >
          {active?.label}
          <ChevronDown className={cn('h-4 w-4 transition-transform', dropdownOpen && 'rotate-180')} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full mt-1 z-20 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            {CASE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setActiveCase(opt.id); setDropdownOpen(false); }}
                className={cn(
                  'flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors hover:bg-secondary',
                  activeCase === opt.id ? 'text-primary' : 'text-foreground',
                )}
              >
                <span>{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.example}</span>
                {activeCase === opt.id && <Check className="h-4 w-4 text-primary ml-2" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {result && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4 font-mono text-base text-foreground break-all">
          <span className="flex-1">{result}</span>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
