export type Category =
  | 'unit'
  | 'time'
  | 'text'
  | 'image'
  | 'dev'
  | 'math'
  | 'game';

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: string;
  tags: string[];
  isNew?: boolean;
  isHot?: boolean;
}
