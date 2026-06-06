import { useState, useCallback } from 'react';
import { CopyButton } from '@/components/shared/CopyButton';

export default function DevUuid() {
  const [singleUuid, setSingleUuid] = useState('');
  const [batchCount, setBatchCount] = useState(5);
  const [batchUuids, setBatchUuids] = useState<string[]>([]);

  const generateSingle = useCallback(() => {
    setSingleUuid(crypto.randomUUID());
  }, []);

  const generateBatch = useCallback(() => {
    const count = Math.max(1, Math.min(100, batchCount));
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) uuids.push(crypto.randomUUID());
    setBatchUuids(uuids);
  }, [batchCount]);

  return (
    <div className="space-y-6">
      {/* Single UUID */}
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">单个 UUID</p>
        <button
          onClick={generateSingle}
          className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
        >
          生成 UUID
        </button>

        {singleUuid && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4 font-mono text-base text-success break-all">
            <span>{singleUuid}</span>
            <CopyButton text={singleUuid} />
          </div>
        )}
      </section>

      {/* Batch UUID */}
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">批量生成</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100}
            value={batchCount}
            onChange={(e) => setBatchCount(Math.max(1, Math.min(100, +e.target.value || 1)))}
            className="w-20 h-10 rounded-lg border border-border bg-background px-3 text-center font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={generateBatch}
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
          >
            批量生成
          </button>
        </div>

        {batchUuids.length > 0 && (
          <>
            <div className="rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm text-success max-h-80 overflow-y-auto whitespace-pre-wrap break-all leading-relaxed">
              {batchUuids.map((uuid, i) => (
                <div key={i}>
                  <span className="text-muted-foreground">
                    {String(i + 1).padStart(3, '0')}.{' '}
                  </span>
                  {uuid}
                </div>
              ))}
            </div>
            <CopyButton text={batchUuids.join('\n')} />
          </>
        )}
      </section>
    </div>
  );
}
