import { useState, useCallback } from 'react';
import { CopyButton } from '@/components/shared/CopyButton';

export default function TextBase64() {
  const [plainText, setPlainText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleEncode = useCallback(() => {
    try {
      setBase64Text(btoa(unescape(encodeURIComponent(plainText))));
      setDecodeError('');
    } catch {
      setDecodeError('编码失败');
    }
  }, [plainText]);

  const handleDecode = useCallback(() => {
    try {
      setPlainText(decodeURIComponent(escape(atob(base64Text))));
      setDecodeError('');
    } catch {
      setDecodeError('解码失败，请检查 Base64 内容');
    }
  }, [base64Text]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('encode'); setDecodeError(''); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
            mode === 'encode'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          编码
        </button>
        <button
          onClick={() => { setMode('decode'); setDecodeError(''); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
            mode === 'decode'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          解码
        </button>
      </div>

      <textarea
        value={mode === 'encode' ? plainText : base64Text}
        onChange={(e) => {
          if (mode === 'encode') setPlainText(e.target.value);
          else setBase64Text(e.target.value);
        }}
        placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 内容...'}
        rows={5}
        className="w-full rounded-xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />

      <button
        onClick={mode === 'encode' ? handleEncode : handleDecode}
        className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
      >
        {mode === 'encode' ? '编码' : '解码'}
      </button>

      {decodeError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {decodeError}
        </div>
      )}

      {(mode === 'encode' ? base64Text : plainText) &&
        !decodeError && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm text-foreground break-all">
            <span className="flex-1">{mode === 'encode' ? base64Text : plainText}</span>
            <CopyButton text={mode === 'encode' ? base64Text : plainText} />
          </div>
        )}
    </div>
  );
}
