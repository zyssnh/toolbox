# 时间工具

> 四个时间处理工具，覆盖时间戳转换、时区对照、倒计时和日期计算。

## 工具概览

| 工具 | 路由 | 核心能力 |
|------|------|----------|
| 时间戳转换 | `time-timestamp` | 双向 Unix 时间戳与人类可读时间的互转 |
| 时区转换 | `time-timezone` | 12 个城市实时时钟，每秒刷新 |
| 倒计时器 | `time-countdown` | 目标时间倒计时，四卡片展示天/时/分/秒 |
| 日期计算 | `time-diff` | 两个日期的差值计算，输出年月日 + 总天数 |

---

## 时间戳转换 (`time-timestamp`)

### 工具概览

双向转换工具：输入 Unix 时间戳（秒或毫秒级）转换为本地时间字符串，或通过日期时间选择器选择时间后转换为对应的时间戳。

### UI 描述

- 上半部分：时间戳输入框 + "当前时间戳"快捷按钮，下方显示转换后的人类可读时间。
- 下半部分：`datetime-local` 输入控件，选择日期时间后自动显示对应的时间戳。
- "当前时间戳"按钮点击后将 `Date.now()` 的毫秒值填入输入框并触发转换。

### 工作原理

时间戳转时间使用 `new Date(timestamp * 1000)` 构造 Date 对象后调用 `toLocaleString()` 展示。时间转时间戳使用 `new Date(datetimeLocalValue).getTime() / 1000` 计算。毫秒级时间戳自动识别：超过 10 位数字的视为毫秒戳。

### 关键实现

```ts
function timestampToHuman(ts: number): string {
  // 自动识别秒级 vs 毫秒级时间戳
  const ms = ts > 9_999_999_999 ? ts : ts * 1000;
  const date = new Date(ms);
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function humanToTimestamp(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

function setCurrentTimestamp(): void {
  input.value = String(Math.floor(Date.now() / 1000));
  triggerConversion();
}
```

### 边界情况

- **毫秒/秒自动识别**：输入值超过 9,999,999,999（约 2286 年对应的秒级时间戳）视为毫秒级。
- **无效时间戳**：输入非数字字符串或超出 Date 有效范围的值时显示错误提示。
- **负时间戳**：表示 1970-01-01 之前的日期，Date 对象可正确处理。
- **datetime-local 空值**：未选择时间时不触发转换。

---

## 时区转换 (`time-timezone`)

### 工具概览

展示全球 12 个主要城市/时区的实时时钟，每个时钟每秒更新一次，使用 `Intl.DateTimeFormat` 实现自动夏令时处理。

### UI 描述

12 张城市卡片以网格布局排列，每张卡片显示城市名（中英文）、当前时间（含秒）、当前日期。所有时钟通过 `setInterval` 每秒同步刷新。

### 工作原理

使用 `Intl.DateTimeFormat` 配合 `timeZone` 选项获取各时区时间，无需手动计算 UTC 偏移。浏览器原生 API 自动处理夏令时（DST）切换。

### 关键实现

```ts
const CITIES = [
  { name: '北京', en: 'Beijing', tz: 'Asia/Shanghai' },
  { name: '东京', en: 'Tokyo', tz: 'Asia/Tokyo' },
  { name: '纽约', en: 'New York', tz: 'America/New_York' },
  { name: '伦敦', en: 'London', tz: 'Europe/London' },
  { name: '巴黎', en: 'Paris', tz: 'Europe/Paris' },
  { name: '悉尼', en: 'Sydney', tz: 'Australia/Sydney' },
  { name: '莫斯科', en: 'Moscow', tz: 'Europe/Moscow' },
  { name: '迪拜', en: 'Dubai', tz: 'Asia/Dubai' },
  { name: '新加坡', en: 'Singapore', tz: 'Asia/Singapore' },
  { name: '洛杉矶', en: 'Los Angeles', tz: 'America/Los_Angeles' },
  { name: '柏林', en: 'Berlin', tz: 'Europe/Berlin' },
  { name: '孟买', en: 'Mumbai', tz: 'Asia/Kolkata' },
];

function formatCityTime(tz: string): { time: string; date: string } {
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat('zh-CN', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(now);
  const dateStr = new Intl.DateTimeFormat('zh-CN', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'long',
  }).format(now);
  return { time: timeStr, date: dateStr };
}

// 组件挂载时启动定时器
let timer = setInterval(() => {
  cities.value = CITIES.map(c => ({
    ...c,
    ...formatCityTime(c.tz),
  }));
}, 1000);
```

### 边界情况

- **夏令时自动切换**：`Intl.DateTimeFormat` 原生处理 DST，无需手动计算偏移量。
- **组件卸载清理**：`onUnmounted` 中调用 `clearInterval(timer)` 防止内存泄漏。
- **初始渲染**：定时器启动前调用一次 `formatCityTime` 确保首帧有内容，避免卡片空白闪烁。
- **非整点偏移时区**：如孟买（UTC+5:30）能正确显示，因为 IANA 时区标识已经包含了偏移信息。

---

## 倒计时器 (`time-countdown`)

### 工具概览

用户输入目标日期时间后，实时显示距离目标还剩多少天、时、分、秒。四张独立卡片分别展示数值，每秒刷新。

### 关键实现

```ts
function computeCountdown(target: string): Countdown | null {
  const targetMs = new Date(target).getTime();
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    finished: false,
  };
}
```

### 边界情况

- **空状态**：未选择目标时间时展示占位符（`--`）而非全零，避免误导。
- **已过期目标**：目标时间已过去时，所有卡片显示 `0` 并展示"倒计时已结束"提示，定时器自动停止。
- **页面隐藏时精度**：浏览器可能限制后台标签页的定时器频率，切换回页面时重新计算差值确保无漂移。

---

## 日期计算 (`time-diff`)

### 工具概览

用户选择两个日期，计算并展示二者之间的差值：精确到年/月/日的结构化结果，以及总天数。

### 关键实现

```ts
function computeDateDiff(start: string, end: string): DateDiff {
  let d1 = new Date(start);
  let d2 = new Date(end);

  // 自动交换：如果开始日期晚于结束日期
  if (d1 > d2) {
    [d1, d2] = [d2, d1];
  }

  const totalDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    months -= 1;
    // 获取上个月的天数
    const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days, totalDays };
}
```

### 边界情况

- **日期顺序自动交换**：开始日期晚于结束日期时，代码内部自动交换两个日期，确保始终输出正值。
- **月末边界**：如 1 月 31 日到 2 月 28 日，天数借位逻辑正确处理。
- **跨闰年**：`new Date(year, month, 0)` 能正确获取该月天数（2 月自动判断 28 或 29 天）。
- **同日选择**：两个日期为同一天时，结果为零年零月零日，总天数为 0。
- **空值检查**：任一日期的 `datetime-local` 输入为空时，不执行计算。
