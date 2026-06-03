import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../../theme';

/* ---------- Pure-JS MD5 implementation ---------- */
function md5(input: string): string {
  function rotateLeft(n: number, s: number) { return (n << s) | (n >>> (32 - s)); }
  function addUnsigned(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)), s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)), s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)), s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)), s), b);
  }
  function wordToHex(w: number) {
    let hex = '';
    for (let i = 0; i <= 3; i++) {
      hex += ((w >>> (i * 8)) & 255).toString(16).padStart(2, '0');
    }
    return hex;
  }

  const inputBytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 0x80) {
      inputBytes.push(code);
    } else if (code < 0x800) {
      inputBytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      inputBytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      // surrogate pair
      const p = 0x10000 + (((code & 0x3ff) << 10) | (input.charCodeAt(++i) & 0x3ff));
      inputBytes.push(
        0xf0 | (p >> 18), 0x80 | ((p >> 12) & 0x3f),
        0x80 | ((p >> 6) & 0x3f), 0x80 | (p & 0x3f)
      );
    }
  }

  const msgLen = inputBytes.length;
  const ml = msgLen * 8;
  inputBytes.push(0x80);
  while (inputBytes.length & 63) {
    if (inputBytes.length % 64 === 56) break;
    inputBytes.push(0);
  }
  while (inputBytes.length % 64 !== 56) inputBytes.push(0);
  for (let i = 0; i < 8; i++) {
    inputBytes.push((ml >>> (i * 8)) & 0xff);
  }

  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let bi = 0; bi < inputBytes.length; bi += 64) {
    const X: number[] = [];
    for (let i = 0; i < 16; i++) {
      X[i] = inputBytes[bi + i * 4] | (inputBytes[bi + i * 4 + 1] << 8) |
        (inputBytes[bi + i * 4 + 2] << 16) | (inputBytes[bi + i * 4 + 3] << 24);
    }
    let A = a0, B = b0, C = c0, D = d0;
    // Round 1
    A = FF(A, B, C, D, X[0], S[0], 0xd76aa478); D = FF(D, A, B, C, X[1], S[1], 0xe8c7b756);
    C = FF(C, D, A, B, X[2], S[2], 0x242070db); B = FF(B, C, D, A, X[3], S[3], 0xc1bdceee);
    A = FF(A, B, C, D, X[4], S[0], 0xf57c0faf); D = FF(D, A, B, C, X[5], S[1], 0x4787c62a);
    C = FF(C, D, A, B, X[6], S[2], 0xa8304613); B = FF(B, C, D, A, X[7], S[3], 0xfd469501);
    A = FF(A, B, C, D, X[8], S[0], 0x698098d8); D = FF(D, A, B, C, X[9], S[1], 0x8b44f7af);
    C = FF(C, D, A, B, X[10], S[2], 0xffff5bb1); B = FF(B, C, D, A, X[11], S[3], 0x895cd7be);
    A = FF(A, B, C, D, X[12], S[0], 0x6b901122); D = FF(D, A, B, C, X[13], S[1], 0xfd987193);
    C = FF(C, D, A, B, X[14], S[2], 0xa679438e); B = FF(B, C, D, A, X[15], S[3], 0x49b40821);
    // Round 2
    A = GG(A, B, C, D, X[1], S[4], 0xf61e2562); D = GG(D, A, B, C, X[6], S[5], 0xc040b340);
    C = GG(C, D, A, B, X[11], S[6], 0x265e5a51); B = GG(B, C, D, A, X[0], S[7], 0xe9b6c7aa);
    A = GG(A, B, C, D, X[5], S[4], 0xd62f105d); D = GG(D, A, B, C, X[10], S[5], 0x02441453);
    C = GG(C, D, A, B, X[15], S[6], 0xd8a1e681); B = GG(B, C, D, A, X[4], S[7], 0xe7d3fbc8);
    A = GG(A, B, C, D, X[9], S[4], 0x21e1cde6); D = GG(D, A, B, C, X[14], S[5], 0xc33707d6);
    C = GG(C, D, A, B, X[3], S[6], 0xf4d50d87); B = GG(B, C, D, A, X[8], S[7], 0x455a14ed);
    A = GG(A, B, C, D, X[13], S[4], 0xa9e3e905); D = GG(D, A, B, C, X[2], S[5], 0xfcefa3f8);
    C = GG(C, D, A, B, X[7], S[6], 0x676f02d9); B = GG(B, C, D, A, X[12], S[7], 0x8d2a4c8a);
    // Round 3
    A = HH(A, B, C, D, X[5], S[8], 0xfffa3942); D = HH(D, A, B, C, X[8], S[9], 0x8771f681);
    C = HH(C, D, A, B, X[11], S[10], 0x6d9d6122); B = HH(B, C, D, A, X[14], S[11], 0xfde5380c);
    A = HH(A, B, C, D, X[1], S[8], 0xa4beea44); D = HH(D, A, B, C, X[4], S[9], 0x4bdecfa9);
    C = HH(C, D, A, B, X[7], S[10], 0xf6bb4b60); B = HH(B, C, D, A, X[10], S[11], 0xbebfbc70);
    A = HH(A, B, C, D, X[13], S[8], 0x289b7ec6); D = HH(D, A, B, C, X[0], S[9], 0xeaa127fa);
    C = HH(C, D, A, B, X[3], S[10], 0xd4ef3085); B = HH(B, C, D, A, X[6], S[11], 0x04881d05);
    A = HH(A, B, C, D, X[9], S[8], 0xd9d4d039); D = HH(D, A, B, C, X[12], S[9], 0xe6db99e5);
    C = HH(C, D, A, B, X[15], S[10], 0x1fa27cf8); B = HH(B, C, D, A, X[2], S[11], 0xc4ac5665);
    // Round 4
    A = II(A, B, C, D, X[0], S[12], 0xf4292244); D = II(D, A, B, C, X[7], S[13], 0x432aff97);
    C = II(C, D, A, B, X[14], S[14], 0xab9423a7); B = II(B, C, D, A, X[5], S[15], 0xfc93a039);
    A = II(A, B, C, D, X[12], S[12], 0x655b59c3); D = II(D, A, B, C, X[3], S[13], 0x8f0ccc92);
    C = II(C, D, A, B, X[10], S[14], 0xffeff47d); B = II(B, C, D, A, X[1], S[15], 0x85845dd1);
    A = II(A, B, C, D, X[8], S[12], 0x6fa87e4f); D = II(D, A, B, C, X[15], S[13], 0xfe2ce6e0);
    C = II(C, D, A, B, X[6], S[14], 0xa3014314); B = II(B, C, D, A, X[13], S[15], 0x4e0811a1);
    A = II(A, B, C, D, X[4], S[12], 0xf7537e82); D = II(D, A, B, C, X[11], S[13], 0xbd3af235);
    C = II(C, D, A, B, X[2], S[14], 0x2ad7d2bb); B = II(B, C, D, A, X[9], S[15], 0xeb86d391);

    a0 = addUnsigned(a0, A); b0 = addUnsigned(b0, B);
    c0 = addUnsigned(c0, C); d0 = addUnsigned(d0, D);
  }
  return (wordToHex(a0) + wordToHex(b0) + wordToHex(c0) + wordToHex(d0)).toLowerCase();
}

/* ---------- Web Crypto helpers ---------- */
async function sha1(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-1', enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function DevHash() {
  const t = useTheme();
  const [input, setInput] = useState('Hello, World!');
  const [md5Hash, setMd5Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    // MD5 is synchronous
    setMd5Hash(input ? md5(input) : '');
    // SHA-1 and SHA-256 are async via Web Crypto
    let cancelled = false;
    async function compute() {
      if (!input) {
        setSha1Hash('');
        setSha256Hash('');
        return;
      }
      const [s1, s256] = await Promise.all([sha1(input), sha256(input)]);
      if (!cancelled) {
        setSha1Hash(s1);
        setSha256Hash(s256);
      }
    }
    compute();
    return () => { cancelled = true; };
  }, [input]);

  const doCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1800);
  }, []);

  const s: Record<string, React.CSSProperties> = {
    container: { padding: 20 },
    textarea: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: t.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
      width: '100%',
      minHeight: 120,
      resize: 'vertical',
      boxSizing: 'border-box',
      outline: 'none',
      lineHeight: 1.6,
    },
    resultRow: {
      background: t.inputBg,
      border: `0.5px solid ${t.border}`,
      borderRadius: 8,
      padding: 12,
      marginTop: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    label: { color: t.textSecondary, fontSize: 13, marginBottom: 6 },
    hashLabel: {
      color: t.textSecondary,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', monospace",
      minWidth: 70,
      flexShrink: 0,
    },
    hashValue: {
      color: t.green,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
      wordBreak: 'break-all',
      flex: 1,
    },
    copyBtn: {
      background: t.hover,
      border: `0.5px solid ${t.border}`,
      borderRadius: 6,
      padding: '4px 12px',
      color: t.text,
      cursor: 'pointer',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.label}>输入文本</div>
      <textarea
        style={s.textarea}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入要计算哈希的文本..."
      />

      {/* MD5 */}
      <div style={s.resultRow}>
        <span style={s.hashLabel}>MD5</span>
        <span style={s.hashValue}>{md5Hash || '—'}</span>
        <button style={s.copyBtn} onClick={() => doCopy(md5Hash, 'md5')}>
          {copied === 'md5' ? '✓' : '复制'}
        </button>
      </div>

      {/* SHA-1 */}
      <div style={s.resultRow}>
        <span style={s.hashLabel}>SHA-1</span>
        <span style={s.hashValue}>{sha1Hash || '—'}</span>
        <button style={s.copyBtn} onClick={() => doCopy(sha1Hash, 'sha1')}>
          {copied === 'sha1' ? '✓' : '复制'}
        </button>
      </div>

      {/* SHA-256 */}
      <div style={s.resultRow}>
        <span style={s.hashLabel}>SHA-256</span>
        <span style={s.hashValue}>{sha256Hash || '—'}</span>
        <button style={s.copyBtn} onClick={() => doCopy(sha256Hash, 'sha256')}>
          {copied === 'sha256' ? '✓' : '复制'}
        </button>
      </div>
    </div>
  );
}
