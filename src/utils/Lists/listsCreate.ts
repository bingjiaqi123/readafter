import { ReadList, ReadScheme } from '../../types';

/**
 * 创建新的阅读列表
 * @param name 列表名称
 * @param schemes 要添加到列表中的方案
 * @param existingLists 现有的阅读列表
 * @returns 更新后的阅读列表数组
 */
export const createReadList = (
  name: string,
  schemes: Array<{ schemeId: string; noteId: string }>,
  existingLists: ReadList[]
): ReadList[] => {
  const newList: ReadList = {
    id: Date.now().toString(),
    name,
    schemes: schemes.map((scheme, index) => ({
      schemeId: scheme.schemeId,
      noteId: scheme.noteId,
      order: index
    }))
  };

  return [...existingLists, newList];
}; 