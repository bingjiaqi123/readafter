import { ReadList, Note, ReadScheme } from '../../types';

/**
 * 删除跟读列表，可以选择不同的删除模式
 * @param readLists 所有跟读列表
 * @param notes 所有笔记
 * @param readSchemes 所有跟读方案
 * @param listId 要删除的列表ID
 * @param deleteMode 删除模式：
 *   - 'list-only': 只删除列表，保留所有跟读方案
 *   - 'unique-schemes': 删除列表和仅在该列表中的跟读方案
 *   - 'all-schemes': 删除列表和所有相关的跟读方案
 * @returns 更新后的跟读列表、笔记列表和跟读方案列表
 */
export function deleteReadList(
  readLists: ReadList[],
  notes: Note[],
  readSchemes: ReadScheme[],
  listId: string,
  deleteMode: 'list-only' | 'unique-schemes' | 'all-schemes'
): { readLists: ReadList[], notes: Note[], readSchemes: ReadScheme[] } {
  // 找到要删除的列表
  const listToDelete = readLists.find(list => list.id === listId);
  if (!listToDelete) {
    return { readLists, notes, readSchemes };
  }

  // 获取该列表中的所有方案ID
  const schemeIds = listToDelete.schemes.map((scheme: { schemeId: string }) => scheme.schemeId);

  // 根据删除模式处理
  switch (deleteMode) {
    case 'list-only':
      // 只删除列表，保留所有跟读方案
      return {
        readLists: readLists.filter(list => list.id !== listId),
        notes,
        readSchemes
      };

    case 'unique-schemes': {
      // 找出仅在该列表中的方案ID
      const uniqueSchemeIds = schemeIds.filter((schemeId: string) => {
        return !readLists.some(list => 
          list.id !== listId && 
          list.schemes.some((scheme: { schemeId: string }) => scheme.schemeId === schemeId)
        );
      });

      // 删除列表和仅在该列表中的方案
      return {
        readLists: readLists.filter(list => list.id !== listId),
        notes,
        readSchemes: readSchemes.filter(scheme => !uniqueSchemeIds.includes(scheme.id))
      };
    }

    case 'all-schemes': {
      // 删除列表和所有相关的跟读方案
      return {
        readLists: readLists.filter(list => list.id !== listId),
        notes,
        readSchemes: readSchemes.filter(scheme => !schemeIds.includes(scheme.id))
      };
    }
  }
} 