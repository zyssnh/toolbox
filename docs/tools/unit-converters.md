# 单位换算工具

> 四个实用换算工具，覆盖长度、重量、温度和数据量四种常见单位转换场景。

## 工具概览

| 工具 | 路由 | 支持单位数 | 换算策略 |
|------|------|-----------|----------|
| 长度换算 | `unit-length` | 9 种 | 统一转换为米（基准单位）后再转为目标单位 |
| 重量换算 | `unit-weight` | 8 种 | 统一转换为克（基准单位）后再转为目标单位 |
| 温度换算 | `unit-temperature` | 3 种 | 仿射变换（偏移 + 缩放），非简单线性比例 |
| 数据量换算 | `unit-data` | 7 种 | 二进制 1024 进制，统一转为字节后换算 |

## UI 描述

每个换算工具共享相同的交互模式：

1. **输入区**：一个数值输入框，用户键入要转换的原始数值。
2. **下拉选择器**：两个 `<select>` 元素，分别选择源单位和目标单位。所有可选单位以中文标签列出。
3. **结果卡片网格**：当用户输入数值后，系统计算该数值在所有支持单位下的等效值，以卡片网格形式一次性展示所有结果。当前选中的目标单位卡片高亮显示。
4. **实时响应**：输入框和下拉选择器的任何变化都会立即重新计算并更新结果卡片。

## 工作原理

### 基准单位策略

长度换算和重量换算采用"基准单位桥接"模式：将源单位先转换为一个内部基准单位（米或克），再将该基准值转换为目标单位。这样只需维护 N 个与基准单位的换算系数，而无需 N×N 个两两换算关系。

对于数据量换算，基准单位为字节（B），各级单位间的倍率为固定的 1024。

### 温度的特殊处理

温度换算不使用基准单位策略，因为摄氏、华氏和开尔文之间的转换涉及偏移量。例如 0°C = 32°F，这并非简单的乘以某个系数。温度采用直接的三对三转换函数。

## 关键实现细节

### 换算核心模式（TypeScript）

```ts
// 长度换算 —— 基准单位策略
const LENGTH_UNITS: Record<string, { label: string; toBase: number }> = {
  km:      { label: '千米 (km)', toBase: 1000 },
  m:       { label: '米 (m)',   toBase: 1 },
  cm:      { label: '厘米 (cm)', toBase: 0.01 },
  mm:      { label: '毫米 (mm)', toBase: 0.001 },
  inch:    { label: '英寸 (in)', toBase: 0.0254 },
  ft:      { label: '英尺 (ft)', toBase: 0.3048 },
  yard:    { label: '码 (yd)',   toBase: 0.9144 },
  mile:    { label: '英里 (mi)', toBase: 1609.344 },
  'light-year': { label: '光年 (ly)', toBase: 9_460_730_472_580_800 },
};

function convertLength(value: number, from: string, to: string): number {
  const baseValue = value * LENGTH_UNITS[from].toBase;
  return baseValue / LENGTH_UNITS[to].toBase;
}

// 生成所有单位的结果
function computeAllResults(value: number, from: string): Record<string, number> {
  const baseValue = value * LENGTH_UNITS[from].toBase;
  const results: Record<string, number> = {};
  for (const [key, unit] of Object.entries(LENGTH_UNITS)) {
    results[key] = baseValue / unit.toBase;
  }
  return results;
}
```

### 温度换算 —— 仿射变换

```ts
function celsiusToFahrenheit(c: number): number {
  return c * 9 / 5 + 32;
}

function fahrenheitToCelsius(f: number): number {
  return (f - 32) * 5 / 9;
}

function celsiusToKelvin(c: number): number {
  return c + 273.15;
}

function kelvinToCelsius(k: number): number {
  return k - 273.15;
}

// 通用温度转换
function convertTemperature(value: number, from: string, to: string): number {
  // 先转为摄氏，再从摄氏转为目标
  const inCelsius = toCelsius(value, from);
  return fromCelsius(inCelsius, to);
}
```

### 数据量换算 —— 1024 进制

```ts
const DATA_UNITS = ['bit', 'B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

function convertData(value: number, from: string, to: string): number {
  const fromIndex = DATA_UNITS.indexOf(from as any);
  const toIndex = DATA_UNITS.indexOf(to as any);

  // 全部转化为 bit 计算
  let bits: number;
  if (from === 'bit') {
    bits = value;
  } else {
    bits = value * 8 * Math.pow(1024, fromIndex - 1);
  }

  if (to === 'bit') return bits;
  return bits / 8 / Math.pow(1024, toIndex - 1);
}
```

## 边界情况处理

- **零值输入**：所有换算结果均为 0，结果卡片正常展示。
- **空输入**：输入框为空时不展示结果卡片，避免显示 `NaN`。
- **源单位与目标单位相同**：换算结果为原值本身，结果卡片依然正常展示。
- **负值输入**：长度和重量允许负值（物理上无意义但数学上成立），温度转换正确处理负值（如 -40°C = -40°F）。
- **极大/极小值**：光年换算中涉及极大数值（约 9.46×10^15），JavaScript 的 `Number` 类型可安全表示 ±2^53 以内的整数，光年级别的换算在前端展示精度足够。数据量 PB 级别的整数运算同样在安全整数范围内。
- **浮点精度**：换算结果使用 `parseFloat(result.toFixed(10))` 去除浮点误差尾巴（如 `0.1 + 0.2 = 0.30000000000000004`）。
- **科学记数法切换**：当结果绝对值 ≥ 1e6 或 < 1e-4 且非零时，自动切换为科学记数法展示，确保可读性。
- **bit 单位的特殊性**：数据量换算中 bit 与其他单位换算时需要额外的 ÷8 或 ×8 因子，代码中单独判断 `from === 'bit'` 分支处理。
