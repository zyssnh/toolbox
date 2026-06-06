import { useState, useMemo } from 'react';

interface Stats {
  totalWithSpaces: number;
  totalNoSpaces: number;
  chineseChars: number;
  englishWords: number;
  numbers: number;
  lines: number;
  paragraphs: number;
}

function calcStats(text: string): Stats {
  return {
    totalWithSpaces: text.length,
    totalNoSpaces: text.replace(/\s/g, '').length,
    chineseChars: (text.match(/[一-鿿]/g) || []).length,
    englishWords: text.trim() ? text.trim().split(/\s+/).length : 0,
    numbers: (text.match(/\d/g) || []).length,
    lines: text ? text.split('\n').length : 0,
    paragraphs: text.split('\n').filter((line) => line.trim().length > 0).length,
  };
}

const STATS: (keyof Stats)[] = [
  'totalWithSpaces',
  'totalNoSpaces',
  'chineseChars',
  'englishWords',
  'numbers',
  'lines',
  'paragraphs',
];

const LABELS: Record<keyof Stats, string> = {
  totalWithSpaces: '总字符（含空格）',
  totalNoSpaces: '总字符（无空格）',
  chineseChars: '中文字符',
  englishWords: '英文单词',
  numbers: '数字',
  lines: '行数',
  paragraphs: '段落数',
};

export default function TextWordcount() {
  const [text, setText] = useState('');
  const stats = useMemo(() => calcStats(text), [text]);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入或粘贴文本..."
        rows={6}
        className="w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATS.map((key) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {stats[key]}
            </span>
            <span className="text-[11px] text-muted-foreground text-center leading-tight">
              {LABELS[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
