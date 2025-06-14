import { useState, useCallback } from 'react';
import { TagInputMode } from './tagInput';

/**
 * 标签输入模式管理的 Hook
 * @param initialMode 初始模式
 * @returns 模式管理相关的状态和方法
 */
export function useTagInputMode(initialMode: TagInputMode = 'quick') {
  const [mode, setMode] = useState<TagInputMode>(initialMode);

  const toggleMode = useCallback(() => {
    setMode(prevMode => prevMode === 'quick' ? 'normal' : 'quick');
  }, []);

  const setModeExplicit = useCallback((newMode: TagInputMode) => {
    setMode(newMode);
  }, []);

  return {
    mode,
    toggleMode,
    setMode: setModeExplicit
  };
} 