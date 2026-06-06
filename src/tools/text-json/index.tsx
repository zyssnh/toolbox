import { useState, useMemo } from 'react';
import { CopyButton } from '@/components/shared/CopyButton';

export default function TextJson() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);

  const { formatted, compact, isError } = useMemo(() => {
    if (!input.trim()) return { formatted: '', compact: '', isError: false };
    try {
      const parsed = JSON.parse(input);
      return {
        formatted: JSON.stringify(parsed, null, indent),
        compact: JSON.stringify(parsed),
        isError: false,
      };
    } catch {
      return { formatted: '', compact: '', isError: true };
    }
  }, [input, indent]);

  const output = indent === 0 ? compact : formatted;

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='输入 JSON 文本... 例如: {"key":"value"}'
        rows={6}
        className="w-full rounded-xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          缩进:
          <select
            value={indent}
            onChange={(e) => setIndent(+e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={0}>压缩</option>
          </select>
        </label>
        {isError && (
          <span className="text-sm text-destructive font-medium">JSON 格式错误</span>
        )}
      </div>

      {output && !isError && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm text-foreground break-all whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
          <code className="flex-1">{output}</code>
          <CopyButton text={output} />
        </div>
      )}
    </div>
  );
}
