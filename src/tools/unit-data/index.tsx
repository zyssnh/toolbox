import { UnitConverter } from '@/components/shared/UnitConverter';

const DATA_UNITS = [
  { symbol: 'b', name: '位 (bit)', toBase: 0.125 },
  { symbol: 'B', name: '字节', toBase: 1 },
  { symbol: 'KB', name: '千字节', toBase: 1024 },
  { symbol: 'MB', name: '兆字节', toBase: 1024 ** 2 },
  { symbol: 'GB', name: '吉字节', toBase: 1024 ** 3 },
  { symbol: 'TB', name: '太字节', toBase: 1024 ** 4 },
  { symbol: 'PB', name: '拍字节', toBase: 1024 ** 5 },
];

export default function UnitData() {
  return <UnitConverter units={DATA_UNITS} />;
}
