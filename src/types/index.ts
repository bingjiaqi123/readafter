export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  isTitleEdited?: boolean;
}

export interface ReadScheme {
  id: string;
  text: string;
  title: string;
  tags: string[];
  timestamp: string;
  noteId?: string;
  isTitleEdited: boolean;
}

export interface ReadList {
  id: string;
  name: string;
  schemes: Array<{
    schemeId: string;
    noteId: string;
    order: number;
  }>;
  isPinned?: boolean;
}

// 类型守卫函数
export function isReadSchemeWithNote(scheme: ReadScheme): scheme is ReadScheme & { noteId: string } {
  return typeof scheme.noteId === 'string' && scheme.noteId !== '';
} 