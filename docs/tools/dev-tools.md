# 开发者工具

> 四个面向开发者的实用小工具，覆盖 UUID 生成、哈希计算、颜色转换和 URL 编解码。

## 工具概览

| 工具 | 路由 | 核心能力 |
|------|------|----------|
| UUID 生成器 | `dev-uuid` | 单次 + 批量生成（1-100 个），一键复制 |
| Hash 计算 | `dev-hash` | 实时 MD5 / SHA-1 / SHA-256 三种哈希算法 |
| 颜色转换 | `dev-color` | HEX / RGB / HSL 双向实时转换，色块预览 |
| URL 编解码 | `dev-url` | encodeURIComponent / decodeURIComponent |

---

## UUID 生成器 (`dev-uuid`)

### 工具概览

基于 `crypto.randomUUID()` 生成符合 RFC 4122 标准的 UUID v4。支持单个生成和批量生成（1 到 100 个），所有结果支持一键复制到剪贴板。

### UI 描述

- 顶部展示最新生成的单个 UUID，带有独立的"复制"按钮。
- 批量生成区域：数量选择器（范围 1-100），点击"批量生成"按钮后以列表形式展示所有 UUID。
- 列表区域包含"复制全部"按钮，将所有 UUID 用换行符拼接后写入剪贴板。

### 关键实现

```ts
function generateUUID(): string {
  return crypto.randomUUID();
}

function generateBatch(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

async function copyAll(uuids: string[]): Promise<void> {
  const text = uuids.join('\n');
  await navigator.clipboard.writeText(text);
}
```

### 边界情况

- **crypto API 可用性**：`crypto.randomUUID()` 在现代浏览器中广泛支持，若不可用则回退到手动拼接 UUID v4（`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` 模板 + `Math.random()`）。
- **批量数量限制**：限制为 1 到 100 个，防止一次生成过多 UUID 导致界面渲染卡顿（100 个 UUID 约 3.6KB 文本，对 DOM 和剪贴板均安全）。
- **剪贴板权限**：`navigator.clipboard.writeText` 在非 HTTPS 环境下可能不可用，此时降级为 `document.execCommand('copy')` 方案。
- **去重**：UUID v4 的碰撞概率极低（122 位随机），批量生成不做去重检查。

---

## Hash 计算 (`dev-hash`)

### 工具概览

输入任意文本，实时计算其 MD5、SHA-1 和 SHA-256 三种哈希值。SHA-1 和 SHA-256 通过 Web Crypto API 实现；MD5 因 Web Crypto API 不支持，使用纯 JavaScript 实现。

### UI 描述

- 输入文本区域（textarea），支持多行文本。
- 三个结果行，分别显示 MD5（32 位十六进制）、SHA-1（40 位）、SHA-256（64 位）。
- 每个结果行带有复制按钮和算法标签。
- 输入内容变化时所有哈希值实时更新。

### 关键实现

```ts
async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function computeSHA1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// MD5 纯 JS 实现（Web Crypto 不支持 MD5）
function computeMD5(text: string): string {
  // 使用 TextEncoder 确保 UTF-8 输入一致
  const bytes = new TextEncoder().encode(text);
  return md5Raw(bytes); // 调用经典 MD5 纯 JS 实现
}
```

经典 MD5 纯 JS 实现的核心步骤（简化）：

```ts
function md5Raw(input: Uint8Array): string {
  // 1. 填充：追加 0x80，补零至 448 mod 512，追加 64 位原始长度
  // 2. 初始化四个 32 位寄存器：A, B, C, D
  // 3. 每 512 位块执行四轮（每轮 16 步）位运算
  // 4. 最终输出 A, B, C, D 的小端十六进制拼接
  // 完整实现约 300 行，此处省略细节
}
```

### 边界情况

- **UTF-8 编码一致性**：所有算法均通过 `TextEncoder().encode()` 将字符串转为 UTF-8 字节序列后再计算摘要，确保中文字符等非 ASCII 内容的哈希结果与后端一致。
- **空字符串**：三种算法均能正常计算空字符串的哈希值（有标准定义的固定值）。
- **大文本性能**：`crypto.subtle.digest` 由浏览器原生 C++ 实现，处理 MB 级文本无性能问题。MD5 纯 JS 实现在大文本下可能较慢，使用 `requestAnimationFrame` 延迟更新避免阻塞 UI。
- **Web Crypto 不可用**：在非安全上下文（HTTP）中 `crypto.subtle` 不可用，此时仅展示 MD5 结果，SHA-1 和 SHA-256 显示"需要 HTTPS 环境"。

---

## 颜色转换 (`dev-color`)

### 工具概览

支持 HEX、RGB 和 HSL 三种颜色表示法之间的双向实时转换。输入任一格式的颜色值，自动转换为另外两种格式，并显示实时颜色预览色块。

### UI 描述

- 三行输入框分别对应 HEX（#RRGGBB 或 #RGB）、RGB（rgb(255, 0, 0) 或纯数值）、HSL。
- 实时预览色块：一个 48×48 的圆角方块，背景色随输入实时变化。
- 任一输入框的值改变时，同步更新另外两个输入框和色块。

### 关键实现

```ts
function hexToRgb(hex: string): [number, number, number] {
  // 支持 #RGB 简写
  const h = hex.replace('#', '');
  const expanded = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
    .join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}
```

### 边界情况

- **HEX 简写格式**：`#F80` 自动展开为 `#FF8800`，支持 3 位或 4 位简写。
- **HEX 带透明度**：`#RRGGBBAA` 格式中被忽略 alpha 通道，仅取 RGB 部分用于转换。
- **RGB 值范围裁剪**：输入超出 0-255 的值时自动 `Math.min(255, Math.max(0, v))` 裁剪。
- **HSL 灰度**：饱和度 `s = 0` 时色相无意义，HSL 转 RGB 中单独处理返回纯灰值。
- **输入容错**：RGB 输入支持 `rgb(255,0,0)` 和 `255, 0, 0` 两种格式，通过正则提取数字部分。
- **循环更新防护**：任一输入框变更触发其他框更新时，使用标志位防止循环触发（A 更新 B，B 又触发 A）。
- **无色彩场景**：输入纯白 `#FFFFFF` 或纯黑 `#000000` 时饱和度自动为 0。

---

## URL 编解码 (`dev-url`)

### 工具概览

对 URL 字符串进行 `encodeURIComponent` 编码和 `decodeURIComponent` 解码。双文本框实时对照。

### UI 描述

- 上方文本框：原始字符串输入。
- 下方文本框：编码/解码后的结果。
- 中间切换按钮可切换编码/解码模式。

### 关键实现

```ts
function encodeURL(text: string): { result: string; error: string | null } {
  try {
    return { result: encodeURIComponent(text), error: null };
  } catch (e) {
    return { result: '', error: `编码失败：${(e as Error).message}` };
  }
}

function decodeURL(encoded: string): { result: string; error: string | null } {
  try {
    return { result: decodeURIComponent(encoded), error: null };
  } catch (e) {
    return { result: '', error: `解码失败：${(e as Error).message}` };
  }
}
```

### 边界情况

- **无效编码序列**：`decodeURIComponent` 遇到非法 UTF-8 序列（如 `%GG` 或截断的 `%E4`）会抛出 `URIError`，代码捕获后显示错误信息。
- **保留字符**：`encodeURIComponent` 会编码除 `A-Z a-z 0-9 - _ . ! ~ * ' ( )` 外的所有字符，这与 `encodeURI`（保留 URL 结构字符）不同，文档中说明使用场景为编码查询参数值。
- **已编码字符串重复编码**：已含 `%XX` 的字符串做 `encodeURIComponent` 时 `%` 会被再次编码为 `%25`，UI 提示用户避免重复编码。
- **emoji 和 Unicode**：`encodeURIComponent` 原生支持所有 Unicode 字符（如 emoji 被编码为 `%F0%9F%98%80` 序列）。
- **空字符串**：编码后仍为空字符串，解码后同理。
