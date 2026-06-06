import { useState, useEffect, useRef } from 'react';
import { CopyButton } from '@/components/shared/CopyButton';
import CryptoJS from 'crypto-js';

function md5(text: string): string {
  return CryptoJS.MD5(text).toString();
}

async function sha1(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-1', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function DevHash() {
  const [input, setInput] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    if (!input) {
      setMd5Hash('');
      setSha1Hash('');
      setSha256Hash('');
      return;
    }

    setMd5Hash(md5(input));

    sha1(input).then((h) => {
      if (!cancelRef.current) setSha1Hash(h);
    });
    sha256(input).then((h) => {
      if (!cancelRef.current) setSha256Hash(h);
    });

    return () => { cancelRef.current = true; };
  }, [input]);

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入文本计算哈希..."
        rows={4}
        className="w-full rounded-xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />

      {input && (
        <div className="space-y-2">
          {[
            { label: 'MD5', value: md5Hash },
            { label: 'SHA-1', value: sha1Hash },
            { label: 'SHA-256', value: sha256Hash },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-3"
            >
              <span className="text-xs text-muted-foreground font-medium w-16 shrink-0">
                {item.label}
              </span>
              <span className="flex-1 font-mono text-xs text-foreground break-all">
                {item.value || '计算中...'}
              </span>
              {item.value && <CopyButton text={item.value} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
