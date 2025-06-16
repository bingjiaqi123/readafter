import { Note, ReadScheme, isReadSchemeWithNote } from '../../types/index';

/**
 * 删除笔记
 * @param notes 所有笔记列表
 * @param id 要删除的笔记ID
 * @returns 更新后的笔记列表
 */
export function deleteNote(notes: Note[], id: string): Note[] {
  // 直接删除笔记
  return notes.filter(note => note.id !== id);
}

/**
 * 批量删除笔记
 * @param notes 所有笔记列表
 * @param ids 要删除的笔记ID数组
 * @returns 更新后的笔记列表
 */
export function deleteNotes(notes: Note[], ids: string[]): Note[] {
  // 批量删除笔记
  return notes.filter(note => !ids.includes(note.id));
}

/**
 * 删除跟读方案
 * @param schemes 所有跟读方案列表
 * @param id 要删除的跟读方案ID
 * @returns 更新后的跟读方案列表
 */
export function deleteScheme(schemes: ReadScheme[], id: string): ReadScheme[] {
  // 直接删除跟读方案
  return schemes.filter(scheme => scheme.id !== id);
}

/**
 * 批量删除跟读方案
 * @param schemes 所有跟读方案列表
 * @param ids 要删除的跟读方案ID数组
 * @returns 更新后的跟读方案列表
 */
export function deleteSchemes(schemes: ReadScheme[], ids: string[]): ReadScheme[] {
  // 批量删除跟读方案
  return schemes.filter(scheme => !ids.includes(scheme.id));
}

/**
 * 删除笔记并同时删除相关的跟读方案
 * @param notes 所有笔记列表
 * @param schemes 所有跟读方案列表
 * @param noteId 要删除的笔记ID
 * @returns 更新后的笔记和跟读方案列表
 */
export function deleteNoteAndSchemes(
  notes: Note[], 
  schemes: ReadScheme[], 
  noteId: string
): { notes: Note[], schemes: ReadScheme[] } {
  // 删除笔记
  const updatedNotes = notes.filter(note => note.id !== noteId);
  
  // 删除与该笔记相关的跟读方案（只删除有noteId的方案）
  const updatedSchemes = schemes.filter(scheme => {
    if (isReadSchemeWithNote(scheme)) {
      return scheme.noteId !== noteId;
    }
    return true; // 保留没有noteId的方案
  });
  
  return { notes: updatedNotes, schemes: updatedSchemes };
}

/**
 * 批量删除笔记并同时删除相关的跟读方案
 * @param notes 所有笔记列表
 * @param schemes 所有跟读方案列表
 * @param noteIds 要删除的笔记ID数组
 * @returns 更新后的笔记和跟读方案列表
 */
export function deleteNotesAndSchemes(
  notes: Note[], 
  schemes: ReadScheme[], 
  noteIds: string[]
): { notes: Note[], schemes: ReadScheme[] } {
  // 批量删除笔记
  const updatedNotes = notes.filter(note => !noteIds.includes(note.id));
  
  // 删除与这些笔记相关的跟读方案（只删除有noteId的方案）
  const updatedSchemes = schemes.filter(scheme => {
    if (isReadSchemeWithNote(scheme)) {
      return !noteIds.includes(scheme.noteId);
    }
    return true; // 保留没有noteId的方案
  });
  
  return { notes: updatedNotes, schemes: updatedSchemes };
} 