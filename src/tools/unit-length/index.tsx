import { UnitConverter } from '@/components/shared/UnitConverter';

const LENGTH_UNITS = [
  { symbol: 'nm', name: '纳米', toBase: 1e-9 },
  { symbol: 'µm', name: '微米', toBase: 1e-6 },
  { symbol: 'mm', name: '毫米', toBase: 0.001 },
  { symbol: 'cm', name: '厘米', toBase: 0.01 },
  { symbol: 'm', name: '米', toBase: 1 },
  { symbol: 'km', name: '千米', toBase: 1000 },
  { symbol: 'in', name: '英寸', toBase: 0.0254 },
  { symbol: 'ft', name: '英尺', toBase: 0.3048 },
  { symbol: 'mi', name: '英里', toBase: 1609.344 },
  { symbol: 'ly', name: '光年', toBase: 9.461e15 },
];

export default function UnitLength() {
  return <UnitConverter units={LENGTH_UNITS} />;
}
