import { useState, useCallback } from 'react';
import { CopyButton } from '@/components/shared/CopyButton';

export default function DevUrl() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleProcess = useCallback(() => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch {
      setError('解码失败，请检查输入内容');
      setOutput('');
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('encode')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
            mode === 'encode'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          URL 编码
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
            mode === 'decode'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          URL 解码
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 URL 编码后的文本...'}
        rows={4}
        className="w-full rounded-xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />

      <button
        onClick={handleProcess}
        className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
      >
        {mode === 'encode' ? '编码' : '解码'}
      </button>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {output && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm text-foreground break-all">
          <span className="flex-1">{output}</span>
          <CopyButton text={output} />
        </div>
      )}
    </div>
  );
}
