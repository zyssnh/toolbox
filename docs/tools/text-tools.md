# 文本工具

> 四个文本处理工具，覆盖编解码、格式化、字数统计和大小写转换。

## 工具概览

| 工具 | 路由 | 核心能力 |
|------|------|----------|
| Base64 编解码 | `text-base64` | 双向实时编解码，支持 UTF-8 |
| JSON 格式化 | `text-json` | 格式化 / 压缩 / 验证三位一体 |
| 字数统计 | `text-wordcount` | 7 项实时统计数据 |
| 大小写转换 | `text-case` | 8 种命名风格一键转换 |

---

## Base64 编解码 (`text-base64`)

### 工具概览

实时双向 Base64 编解码工具。上方文本框输入原文，下方立即输出 Base64 编码结果；在下方输入 Base64 字符串，上方实时解码还原。

### UI 描述

双文本框上下布局，每个文本框带有标签和复制按钮。中间有编码/解码方向指示图标。任一文本框的内容变化都会立即触发另一方更新。

### 工作原理

编码方向使用 `btoa()` 但需要处理 Unicode 字符（`btoa` 仅支持 Latin1）。解码方向使用 `atob()`。通过 `TextEncoder` / `TextDecoder` 桥接 UTF-8 字符。

### 关键实现

```ts
function encodeBase64(text: string): string {
  // 处理 UTF-8：先编码为字节序列再转 base64
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function decodeBase64(encoded: string): string {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return ''; // 无效 base64 时静默失败，错误信息在 UI 中展示
  }
}
```

### 边界情况

- **Unicode 字符**：中文字符、emoji 等通过 `TextEncoder` / `TextDecoder` 桥接编码，不会出现 `btoa` 直接处理多字节字符时的 `InvalidCharacterError`。
- **无效 Base64 输入**：解码失败时 `catch` 异常，在解码输出区域显示红色错误提示，但不阻断继续输入。
- **空字符串**：编解码空字符串得到空字符串，两个文本框同步清空。
- **含空格的 Base64**：某些场景下 Base64 字符串可能包含换行或空格，解析前自动 strip 所有空白字符。
- **实时防抖**：使用 `debounce(300ms)` 避免用户快速连续输入时频繁触发计算，提升性能。

---

## JSON 格式化 (`text-json`)

### 工具概览

提供 JSON 数据的格式化、压缩和校验三种操作。输入任意 JSON 文本（或类 JSON 字符串），一键完成美化或压缩，同时验证 JSON 合法性。

### UI 描述

- 顶部大文本区域用于 JSON 输入。
- 操作按钮组：格式化（prettify）、压缩（minify）、验证（validate）、复制结果、清空。
- 下方输出区域展示处理后的 JSON 或校验错误信息。
- 验证出错时显示错误位置（行号、列号）。

### 关键实现

```ts
function formatJSON(input: string): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed, null, 2), error: null };
  } catch (e) {
    const match = (e as SyntaxError).message.match(/position (\d+)/);
    const pos = match ? parseInt(match[1]) : -1;
    let errorMsg = `无效 JSON：${(e as SyntaxError).message}`;
    if (pos >= 0) {
      const lines = input.slice(0, pos).split('\n');
      errorMsg += `\n错误位置：第 ${lines.length} 行，第 ${lines[lines.length - 1].length + 1} 列`;
    }
    return { result: '', error: errorMsg };
  }
}

function minifyJSON(input: string): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed), error: null }; // 无缩进即压缩
  } catch (e) {
    return { result: '', error: `无效 JSON：${(e as SyntaxError).message}` };
  }
}
```

### 边界情况

- **尾随逗号**：JSON 标准不允许多余逗号，但用户可能从 JS 对象字面量复制，解析失败时错误信息明确指出位置。
- **单引号 JSON**：工具只接受严格 JSON（双引号），提示用户转换为双引号。
- **顶级非对象/数组**：JSON 支持字符串、数字等顶级值，工具能正常格式化它们。
- **嵌套深度过大**：JSON.stringify 默认无深度限制，但超大 JSON 可能导致浏览器卡顿，输入大小超过 1MB 时先警告用户。
- **空输入**：空文本框点击格式化时显示"请先输入 JSON 内容"提示。

---

## 字数统计 (`text-wordcount`)

### 工具概览

实时统计输入文本的 7 项指标，每项指标对应一张小卡片。所有统计在输入变化时实时更新。

### 7 项统计指标

| 指标 | 统计方式 |
|------|----------|
| 总字符数（含空格） | `text.length` |
| 总字符数（不含空格） | 去除 `\s` 后的长度 |
| 中文字符数 | 匹配 Unicode CJK 区间 `[一-鿿㐀-䶿]` |
| 英文单词数 | 按连续字母序列分割 `[a-zA-Z]+` |
| 数字个数 | 统计 `[0-9]` 单个数字字符 |
| 行数 | 按 `\n` 分割后的数量（含最后空行） |
| 段落数 | 按连续两个及以上换行符 `\n\n+` 分割 |

### 关键实现

```ts
function computeWordCount(text: string): WordCountStats {
  return {
    charsWithSpaces: text.length,
    charsWithoutSpaces: text.replace(/\s/g, '').length,
    cjkChars: (text.match(/[一-鿿㐀-䶿]/g) || []).length,
    englishWords: (text.match(/[a-zA-Z]+/g) || []).length,
    digits: (text.match(/\d/g) || []).length,
    lines: text === '' ? 0 : text.split('\n').length,
    paragraphs: text === '' ? 0 : text.trim().split(/\n{2,}/).length || 1,
  };
}
```

### 边界情况

- **空字符串**：所有指标为 0，行数为 0（与只有 1 个空行区分）。
- **纯空白文本**：含空格计数正常，不含空格为 0；行数和段落数仍正常计算。
- **混合内容**：中英文混合时各项独立统计互不干扰（一个字符只会被归入一类）。
- **数字单词**：连续的阿拉伯数字算入"数字个数"而不会误计为英文单词。
- **多换行符**：两个以上连续 `\n` 识别为段落分隔符，`trim()` 避免首尾空白造成多余空段。

---

## 大小写转换 (`text-case`)

### 工具概览

将任意文本转换为 8 种常见命名风格。输入一段文本，点击对应按钮即可获得转换结果。

### 8 种大小写风格

| 风格 | 示例 | 规则 |
|------|------|------|
| `camelCase` | `helloWorld` | 首词小写，后续词首字母大写 |
| `PascalCase` | `HelloWorld` | 每个词首字母大写 |
| `snake_case` | `hello_world` | 全小写，下划线分隔 |
| `UPPER_SNAKE` | `HELLO_WORLD` | 全大写，下划线分隔 |
| `kebab-case` | `hello-world` | 全小写，短横线分隔 |
| `UPPER CASE` | `HELLO WORLD` | 全大写，空格分隔 |
| `lower case` | `hello world` | 全小写，空格分隔 |
| `Title Case` | `Hello World` | 每词首字母大写，空格分隔 |

### 关键实现

```ts
type CaseStyle = 'camel' | 'pascal' | 'snake' | 'upperSnake' | 'kebab' | 'upper' | 'lower' | 'title';

function convertCase(text: string, style: CaseStyle): string {
  // 先将输入拆分为词元
  const words = tokenizeWords(text);

  switch (style) {
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : capitalize(w.toLowerCase())).join('');
    case 'pascal':
      return words.map(w => capitalize(w.toLowerCase())).join('');
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_');
    case 'upperSnake':
      return words.map(w => w.toUpperCase()).join('_');
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-');
    case 'upper':
      return words.map(w => w.toUpperCase()).join(' ');
    case 'lower':
      return words.map(w => w.toLowerCase()).join(' ');
    case 'title':
      return words.map(w => capitalize(w.toLowerCase())).join(' ');
  }
}

function tokenizeWords(text: string): string[] {
  // 在大小写边界、空格、下划线、短横线处拆分
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
```

### 边界情况

- **已格式化输入**：`tokenizeWords` 能识别已存在的分隔符（空格、下划线、短横线、大小写边界），无论输入哪种格式都能正确分词。
- **空字符串**：返回空字符串，不抛异常。
- **连续大写缩写**：如 `XMLParser` 被正确拆分为 `['XML', 'Parser']`，如果使用更精确的缩写拆分规则（检测连续大写后加小写的情况）。
- **纯数字/符号**：`tokenizeWords` 中 `filter(Boolean)` 会过滤掉纯分隔符产生的空词元，但数字会被保留为合法词元。
- **首词大写保留**：转换到 camelCase 时首词保持全小写，即使原始输入首词含有大写字母。
