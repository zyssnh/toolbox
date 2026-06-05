import { lazy } from 'react';
import type { ToolMeta } from './types';

export const toolMetas: ToolMeta[] = [
  // 单位换算
  { id: 'unit-length', name: '长度换算', description: 'km / m / cm / inch / ft / 光年', category: 'unit', icon: '📏', tags: ['长度','距离','米','英尺','换算'], isHot: true },
  { id: 'unit-weight', name: '重量换算', description: 'kg / lb / oz / 克 / 斤', category: 'unit', icon: '⚖️', tags: ['重量','公斤','磅','换算'] },
  { id: 'unit-temperature', name: '温度换算', description: '摄氏 / 华氏 / 开尔文', category: 'unit', icon: '🌡️', tags: ['温度','摄氏','华氏','开尔文'] },
  { id: 'unit-data', name: '数据量换算', description: 'B / KB / MB / GB / TB', category: 'unit', icon: '💾', tags: ['存储','字节','MB','GB','换算'], isNew: true },
  { id: 'unit-currency', name: '汇率换算', description: 'CNY / USD / EUR / JPY / GBP 等', category: 'unit', icon: '💱', tags: ['汇率','货币','人民币','美元','换算'], isNew: true },
  // 时间日期
  { id: 'time-timestamp', name: '时间戳转换', description: 'Unix 时间戳 ↔ 人类可读时间', category: 'time', icon: '🕐', tags: ['时间戳','unix','timestamp'], isHot: true },
  { id: 'time-timezone', name: '时区转换', description: '全球主要城市时区对照', category: 'time', icon: '🌍', tags: ['时区','时差','UTC','GMT'] },
  { id: 'time-countdown', name: '倒计时器', description: '精确倒计时，支持自定义标题', category: 'time', icon: '⏱️', tags: ['倒计时','计时器'] },
  { id: 'time-diff', name: '日期计算', description: '计算两个日期之间的差值', category: 'time', icon: '📅', tags: ['日期','天数','差值','计算'] },
  // 文本处理
  { id: 'text-base64', name: 'Base64 编解码', description: '文本与 Base64 互转', category: 'text', icon: '🔤', tags: ['base64','编码','解码'], isHot: true },
  { id: 'text-json', name: 'JSON 格式化', description: '格式化、压缩、校验 JSON', category: 'text', icon: '{ }', tags: ['json','格式化','美化','压缩'] },
  { id: 'text-wordcount', name: '字数统计', description: '统计字符数、单词数、行数', category: 'text', icon: '📊', tags: ['字数','统计','word count'] },
  { id: 'text-case', name: '大小写转换', description: '多种英文大小写风格转换', category: 'text', icon: 'Aa', tags: ['大小写','camelCase','snake_case'] },
  // 开发工具
  { id: 'dev-uuid', name: 'UUID 生成器', description: '生成 UUID v4，批量可选', category: 'dev', icon: '🆔', tags: ['uuid','guid','生成'] },
  { id: 'dev-hash', name: 'Hash 计算', description: 'MD5 / SHA1 / SHA256 哈希', category: 'dev', icon: '#️⃣', tags: ['hash','md5','sha256','加密'] },
  { id: 'dev-color', name: '颜色转换', description: 'HEX / RGB / HSL 互转', category: 'dev', icon: '🎨', tags: ['颜色','color','hex','rgb','hsl'] },
  { id: 'dev-url', name: 'URL 编解码', description: 'URL encode / decode', category: 'dev', icon: '🔗', tags: ['url','encode','decode','编码'] },
  // 游戏
  { id: 'game-2048', name: '2048', description: '滑动合并数字方块', category: 'game', icon: '🎯', tags: ['2048','游戏','益智'], isNew: true },
  { id: 'game-snake', name: '贪吃蛇', description: '键盘或触屏操控', category: 'game', icon: '🐍', tags: ['贪吃蛇','游戏'] },
  { id: 'game-minesweeper', name: '扫雷', description: '经典三难度扫雷', category: 'game', icon: '💣', tags: ['扫雷','游戏'] },
  { id: 'game-sudoku', name: '数独', description: '随机生成，三种难度', category: 'game', icon: '🔢', tags: ['数独','游戏','puzzle'] },
];

export const toolComponents: Record<string, React.LazyExoticComponent<any>> = {
  'unit-length': lazy(() => import('./tools/unit-length')),
  'unit-weight': lazy(() => import('./tools/unit-weight')),
  'unit-temperature': lazy(() => import('./tools/unit-temperature')),
  'unit-data': lazy(() => import('./tools/unit-data')),
  'unit-currency': lazy(() => import('./tools/unit-currency')),
  'time-timestamp': lazy(() => import('./tools/time-timestamp')),
  'time-timezone': lazy(() => import('./tools/time-timezone')),
  'time-countdown': lazy(() => import('./tools/time-countdown')),
  'time-diff': lazy(() => import('./tools/time-diff')),
  'text-base64': lazy(() => import('./tools/text-base64')),
  'text-json': lazy(() => import('./tools/text-json')),
  'text-wordcount': lazy(() => import('./tools/text-wordcount')),
  'text-case': lazy(() => import('./tools/text-case')),
  'dev-uuid': lazy(() => import('./tools/dev-uuid')),
  'dev-hash': lazy(() => import('./tools/dev-hash')),
  'dev-color': lazy(() => import('./tools/dev-color')),
  'dev-url': lazy(() => import('./tools/dev-url')),
  'game-2048': lazy(() => import('./tools/game-2048')),
  'game-snake': lazy(() => import('./tools/game-snake')),
  'game-minesweeper': lazy(() => import('./tools/game-minesweeper')),
  'game-sudoku': lazy(() => import('./tools/game-sudoku')),
};

export const categories = [
  { id: 'all', label: '全部', icon: '⚡' },
  { id: 'unit', label: '单位换算', icon: '⚖️' },
  { id: 'time', label: '时间日期', icon: '🕐' },
  { id: 'text', label: '文本处理', icon: '📝' },
  { id: 'dev', label: '开发工具', icon: '💻' },
  { id: 'game', label: '小游戏', icon: '🎮' },
] as const;
