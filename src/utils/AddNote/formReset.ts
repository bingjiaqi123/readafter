import { Dispatch, SetStateAction } from 'react';
import { TagInputMode } from './tagInput';

/**
 * 重置笔记表单的状态
 * @param setContent - 设置内容的状态更新函数
 * @param setTags - 设置标签的状态更新函数
 * @param setMode - 设置标签输入模式的状态更新函数
 */
export const resetNoteForm = (
  setContent: Dispatch<SetStateAction<string>>,
  setTags: Dispatch<SetStateAction<string[]>>,
  setMode?: (mode: TagInputMode) => void
) => {
  // 重置内容
  setContent('');
  // 重置标签
  setTags([]);
  // 如果提供了模式设置函数，重置为快速模式
  if (setMode) {
    setMode('quick');
  }
}; 