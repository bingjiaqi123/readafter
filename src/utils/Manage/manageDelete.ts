import { Note } from '../../types/index';

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