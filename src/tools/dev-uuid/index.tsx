import React, { useState, useCallback } from 'react';
import { useTheme } from '../../theme';

export default function DevUuid() {
  const t = useTheme();
  const [singleUuid, setSingleUuid] = useState('');
  const [batchCount, setBatchCount] = useState(5);
  const [batchUuids, setBatchUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState('');

  const generateSingle = useCallback(() => {
    const uuid = crypto.randomUUID();
    setSingleUuid(uuid);
    setCopied('');
  }, []);

  const generateBatch = useCallback(() => {
    const count = Math.max(1, Math.min(100, batchCount));
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      uuids.push(crypto.randomUUID());
    }
    setBatchUuids(uuids);
    setCopied('');
  }, [batchCount]);

  const copySingle = useCallback(() => {
    navigator.clipboard.writeText(singleUuid);
    setCopied('single');
    setTimeout(() => setCopied(''), 1800);
  }, [singleUuid]);

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(batchUuids.join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(''), 1800);
  }, [batchUuids]);

  const styles: Record<string, React.CSSProperties> = {
    container: { padding: 20 },
    input: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: t.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
      width: 60,
      textAlign: 'center',
      outline: 'none',
    },
    primaryBtn: {
      background: t.primary,
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '8px 20px',
      cursor: 'pointer',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
    },
    secondaryBtn: {
      background: t.hover,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '8px 14px',
      color: t.text,
      cursor: 'pointer',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
    },
    resultBox: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 8,
      padding: 16,
      fontFamily: "'JetBrains Mono', monospace",
      color: t.green,
      fontSize: 18,
      wordBreak: 'break-all',
      marginTop: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: { color: t.textSecondary, fontSize: 13, marginBottom: 6 },
    row: { display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 },
    scrollList: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 8,
      padding: 16,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
      color: t.green,
      maxHeight: 320,
      overflowY: 'auto',
      marginTop: 16,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      lineHeight: 1.8,
    },
    sectionTitle: { color: t.text, fontSize: 15, fontWeight: 600, marginTop: 24 },
  };

  return (
    <div style={styles.container}>
      {/* Single UUID */}
      <div>
        <div style={styles.label}>单个 UUID</div>
        <div style={styles.row}>
          <button style={styles.primaryBtn} onClick={generateSingle}>
            生成 UUID
          </button>
        </div>
        {singleUuid && (
          <div style={styles.resultBox}>
            <span>{singleUuid}</span>
            <button style={styles.secondaryBtn} onClick={copySingle}>
              {copied === 'single' ? '✓ 已复制' : '复制'}
            </button>
          </div>
        )}
      </div>

      {/* Batch UUID */}
      <div style={styles.sectionTitle}>批量生成</div>
      <div style={styles.row}>
        <input
          type="number"
          min={1}
          max={100}
          value={batchCount}
          onChange={(e) => setBatchCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          style={styles.input}
        />
        <button style={styles.primaryBtn} onClick={generateBatch}>
          批量生成
        </button>
      </div>

      {batchUuids.length > 0 && (
        <>
          <div style={styles.scrollList}>
            {batchUuids.map((uuid, i) => (
              <div key={i}>
                <span style={{ color: t.textSecondary }}>{String(i + 1).padStart(3, '0')}. </span>
                {uuid}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button style={styles.secondaryBtn} onClick={copyAll}>
              {copied === 'all' ? '✓ 已复制全部' : '一键复制全部'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
