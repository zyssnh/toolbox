import { UnitConverter } from '@/components/shared/UnitConverter';

const WEIGHT_UNITS = [
  { symbol: 'mg', name: '毫克', toBase: 0.000001 },
  { symbol: 'g', name: '克', toBase: 0.001 },
  { symbol: 'kg', name: '千克', toBase: 1 },
  { symbol: 't', name: '吨', toBase: 1000 },
  { symbol: 'lb', name: '磅', toBase: 0.453592 },
  { symbol: 'oz', name: '盎司', toBase: 0.0283495 },
  { symbol: '斤', name: '市斤', toBase: 0.5 },
  { symbol: '两', name: '市两', toBase: 0.05 },
];

export default function UnitWeight() {
  return <UnitConverter units={WEIGHT_UNITS} />;
}
