import { Note, ReadScheme } from '../../types/index';

interface DisplayScheme {
  id: string;
  text: string;
  title?: string;
  timestamp: string;
  noteTitle: string;
  noteTags: string[];
  isInList: boolean;
}

/**
 * 搜索笔记
 * @param notes 所有笔记列表
 * @param searchTerm 搜索关键词
 * @param readSchemes 所有跟读方案
 * @returns 匹配的笔记列表
 */
export function searchNotes(notes: Note[], searchTerm: string, readSchemes: ReadScheme[]): Note[] {
  if (!searchTerm.trim()) return notes;

  const searchLower = searchTerm.toLowerCase();
  return notes.filter(note => {
    // Check note title and content
    if (note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Check note tags
    if (note.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
      return true;
    }

    // Check associated schemes
    const noteSchemes = readSchemes.filter(scheme => scheme.noteId === note.id);
    if (noteSchemes.some(scheme => 
      scheme.text.toLowerCase().includes(searchLower) ||
      (scheme.title && scheme.title.toLowerCase().includes(searchLower))
    )) {
      return true;
    }

    return false;
  });
}

/**
 * 搜索跟读方案
 * @param notes 笔记列表
 * @param readLists 跟读列表
 * @param readSchemes 所有跟读方案
 * @param searchTerm 搜索关键词
 * @param selectedTag 选中的标签（可选）
 * @param hideListedSchemes 是否隐藏已加入列表的方案
 * @returns 过滤后的跟读方案列表
 */
export function searchReadSchemes(
  notes: Note[],
  readLists: Array<{
    id: string;
    name: string;
    schemes: Array<{
      schemeId: string;
      noteId: string;
      order: number;
    }>;
  }>,
  readSchemes: ReadScheme[],
  searchTerm: string,
  selectedTag?: string | null,
  hideListedSchemes: boolean = false
): DisplayScheme[] {
  const schemes: DisplayScheme[] = [];

  // 收集所有跟读方案
  readSchemes.forEach(scheme => {
    const note = notes.find(n => n.id === scheme.noteId);
    if (!note) return;

    const isInList = readLists.some(list =>
      list.schemes.some(s => s.schemeId === scheme.id)
    );

    // 如果设置了隐藏已加入列表的方案，则跳过
    if (hideListedSchemes && isInList) return;

    // 将 ReadScheme 转换为 DisplayScheme
    const displayScheme: DisplayScheme = {
      id: scheme.id,
      text: scheme.text,
      title: scheme.title,
      timestamp: scheme.timestamp,
      noteTitle: note.title,
      noteTags: note.tags || [],
      isInList
    };

    schemes.push(displayScheme);
  });

  // 应用搜索和标签筛选
  const searchLower = searchTerm.toLowerCase();
  return schemes.filter(scheme => {
    // 检查标签筛选
    if (selectedTag) {
      const hasSelectedTag = scheme.noteTags.some(tag => 
        tag.startsWith(selectedTag)
      );
      if (!hasSelectedTag) return false;
    }

    // 如果没有搜索词，只按标签筛选
    if (!searchTerm) return true;

    // 搜索方案标题、内容、笔记标题和标签
    return (
      (scheme.title?.toLowerCase().includes(searchLower) || false) ||
      scheme.text.toLowerCase().includes(searchLower) ||
      scheme.noteTitle.toLowerCase().includes(searchLower) ||
      scheme.noteTags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
} 