import { Note, ReadScheme } from '../../types/index';

/**
 * 过滤笔记列表，可以选择是否隐藏已添加跟读方案的笔记
 * @param notes 所有笔记列表
 * @param readSchemes 所有跟读方案
 * @param hideSchemedNotes 是否隐藏已添加跟读方案的笔记
 * @returns 过滤后的笔记列表
 */
export function filterNotes(notes: Note[], readSchemes: ReadScheme[], hideSchemedNotes: boolean): Note[] {
  if (!hideSchemedNotes) return notes;
  
  return notes.filter(note => {
    const noteSchemes = readSchemes.filter(scheme => scheme.noteId === note.id);
    return noteSchemes.length === 0;
  });
}

/**
 * 过滤出没有跟读方案的笔记
 * @param notes 所有笔记列表
 * @param readSchemes 所有跟读方案
 * @returns 没有跟读方案的笔记列表
 */
export function filterNotesWithoutSchemes(notes: Note[], readSchemes: ReadScheme[]): Note[] {
  return notes.filter(note => {
    const noteSchemes = readSchemes.filter(scheme => scheme.noteId === note.id);
    return noteSchemes.length === 0;
  });
}

/**
 * 根据标签过滤笔记
 * @param notes 所有笔记列表
 * @param selectedTag 选中的标签
 * @param readSchemes 所有跟读方案
 * @returns 过滤后的笔记列表
 */
export function filterNotesByTag(notes: Note[], selectedTag: string | null, readSchemes: ReadScheme[]): Note[] {
  if (!selectedTag) return notes;

  return notes.filter(note => {
    // 检查笔记标签
    const hasNoteTag = (note.tags || []).some(tag => tag.startsWith(selectedTag));
    if (hasNoteTag) return true;

    // 检查关联的跟读方案标签
    const noteSchemes = readSchemes.filter(scheme => scheme.noteId === note.id);
    return noteSchemes.some(scheme => 
      (scheme.tags || []).some(tag => tag.startsWith(selectedTag))
    );
  });
} 