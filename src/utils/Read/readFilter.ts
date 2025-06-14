import { ReadScheme, ReadList, Note } from '../../types/index';

export interface FilteredScheme {
  id: string;
  text: string;
  title?: string;
  timestamp: string;
  noteTitle: string;
  noteTags: string[];
  isInList: boolean;
  isTitleEdited: boolean;
}

/**
 * 过滤跟读方案
 * @param notes 笔记列表
 * @param readLists 跟读列表
 * @param readSchemes 跟读方案列表
 * @param hideListedSchemes 是否隐藏已加入列表的方案
 * @param searchTerm 搜索关键词
 * @param selectedTag 选中的标签
 * @returns 过滤后的方案列表
 */
export const filterSchemes = (
  notes: Note[],
  readLists: ReadList[],
  readSchemes: ReadScheme[],
  hideListedSchemes: boolean,
  searchTerm: string,
  selectedTag: string | null
): FilteredScheme[] => {
  let schemes = readSchemes.map(scheme => {
    const note = notes.find(n => n.id === scheme.noteId);
    return {
      id: scheme.id,
      text: scheme.text,
      title: scheme.title,
      timestamp: scheme.timestamp,
      noteTitle: note?.title || '',
      noteTags: scheme.tags || [],
      isInList: readLists.some(list =>
        list.schemes.some(s => s.schemeId === scheme.id)
      ),
      isTitleEdited: scheme.isTitleEdited || false
    };
  });

  // 过滤已加入列表的方案
  if (hideListedSchemes) {
    schemes = schemes.filter(scheme => !scheme.isInList);
  }

  // 搜索过滤
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    schemes = schemes.filter(
      scheme =>
        (scheme.title?.toLowerCase() || '').includes(searchLower) ||
        scheme.text.toLowerCase().includes(searchLower) ||
        scheme.noteTitle.toLowerCase().includes(searchLower) ||
        scheme.noteTags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // 标签过滤
  if (selectedTag) {
    schemes = schemes.filter(scheme =>
      scheme.noteTags.some(tag => tag.startsWith(selectedTag))
    );
  }

  return schemes;
}; 