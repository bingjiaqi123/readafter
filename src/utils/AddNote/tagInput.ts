/**
 * 标签输入模式
 */
export type TagInputMode = 'quick' | 'normal';

/**
 * 标签输入组件的属性
 */
export interface TagInputProps {
  /** 当前标签列表 */
  tags: string[];
  /** 标签变更回调 */
  onChange: (tags: string[]) => void;
  /** 当前输入模式 */
  mode: TagInputMode;
  /** 模式切换回调 */
  onModeChange: (mode: TagInputMode) => void;
}

/**
 * 普通标签输入组件的属性（不包含 mode）
 */
export type NormalTagInputProps = Omit<TagInputProps, 'mode'>;

/**
 * 处理标签字符串，转换为标签数组
 * @param tagString 逗号分隔的标签字符串
 * @returns 处理后的标签数组
 */
export const processTagString = (tagString: string): string[] => {
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

/**
 * 验证标签是否有效
 * @param tag 要验证的标签
 * @returns 标签是否有效
 */
export const isValidTag = (tag: string): boolean => {
  const trimmed = tag.trim();
  return trimmed.length > 0 && !trimmed.includes(',');
}; 