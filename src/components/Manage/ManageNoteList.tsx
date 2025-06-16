import { Note, ReadScheme } from '../../types';
import { useState } from 'react';
import { AddReadDialog } from './AddReadDialog';
import { EditNoteDialog } from './EditNoteDialog';
import { TextDeleteButton } from '../TextDeleteButton';
import { Dialog } from '@headlessui/react';

interface ManageNoteListProps {
  items: Note[];
  readSchemes: ReadScheme[];
  onSearchChange?: (term: string) => void;
  hideSchemedNotes: boolean;
  onHideSchemedChange: (hide: boolean) => void;
  isMultiSelect: boolean;
  isAllSelect: boolean;
  selectedNotes: Set<string>;
  onNoteSelect: (noteId: string) => void;
  onEditNote: (noteId: string, title: string, content: string, tags: string[]) => void;
  onDeleteNote: (noteId: string, deleteMode: 'note-only' | 'note-and-schemes') => void;
  onAddReadScheme: (noteId: string, text: string, title?: string) => void;
}

export function ManageNoteList({
  items,
  readSchemes,
  isMultiSelect,
  isAllSelect,
  selectedNotes,
  onNoteSelect,
  onEditNote,
  onDeleteNote,
  onAddReadScheme
}: ManageNoteListProps) {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [addingReadNote, setAddingReadNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
  };

  const handleDeleteClick = (note: Note) => {
    setDeletingNote(note);
  };

  const handleDeleteConfirm = (deleteMode: 'note-only' | 'note-and-schemes') => {
    if (deletingNote) {
      onDeleteNote(deletingNote.id, deleteMode);
      setDeletingNote(null);
    }
  };

  const handleAddReadClick = (note: Note) => {
    setAddingReadNote(note);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {items.map(note => {
        const hasScheme = readSchemes.some(scheme => scheme.noteId === note.id);
        const isSelectMode = isMultiSelect || isAllSelect;
        return (
          <div
            key={note.id}
            onClick={() => isSelectMode && onNoteSelect(note.id)}
            className={`p-4 border rounded-lg ${
              isSelectMode
                ? 'cursor-pointer hover:border-indigo-500'
                : 'border-gray-200 hover:border-gray-300'
            } ${
              selectedNotes.has(note.id)
                ? 'border-indigo-500 bg-indigo-50'
                : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {isSelectMode && (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedNotes.has(note.id)}
                        onChange={() => onNoteSelect(note.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        onClick={e => e.stopPropagation()}
                        aria-label={`选择笔记：${note.title}`}
                      />
                    </label>
                  )}
                  <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                  {hasScheme && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      已添加 {readSchemes.filter(scheme => scheme.noteId === note.id).length} 个跟读方案
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(note.timestamp).toLocaleString()}
                </p>
              </div>
              {!isSelectMode && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddReadClick(note);
                    }}
                    className="px-3 py-1 text-green-600 hover:text-green-800 text-sm"
                  >
                    添加跟读方案
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(note);
                    }}
                    className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    编辑
                  </button>
                  <TextDeleteButton
                    onClick={(e) => {
                      if (e) e.stopPropagation();
                      handleDeleteClick(note);
                    }}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
            <div className="mt-2">
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2 text-gray-700 whitespace-pre-wrap">
              {note.content}
            </div>
          </div>
        );
      })}

      {/* 编辑笔记弹窗 */}
      {editingNote && (
        <EditNoteDialog
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={(title, content, tags) => {
            onEditNote(editingNote.id, title, content, tags);
            setEditingNote(null);
          }}
        />
      )}

      {/* 添加跟读方案弹窗 */}
      {addingReadNote && (
        <AddReadDialog
          note={addingReadNote}
          onClose={() => setAddingReadNote(null)}
          onAdd={(noteId, text, title) => {
            onAddReadScheme(noteId, text, title);
            setAddingReadNote(null);
          }}
        />
      )}

      {/* 删除确认弹窗 */}
      {deletingNote && (
        <Dialog
          open={true}
          onClose={() => setDeletingNote(null)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <Dialog.Title className="text-lg font-medium mb-4">
                删除笔记
              </Dialog.Title>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  确定要删除笔记 <span className="font-medium">"{deletingNote.title}"</span> 吗？
                </p>
                <p className="text-sm text-gray-500">
                  此操作无法撤销。
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleDeleteConfirm('note-only')}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-left"
                >
                  仅删除笔记
                </button>
                <button
                  onClick={() => handleDeleteConfirm('note-and-schemes')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-left"
                >
                  一并删除相关跟读方案
                </button>
                <button
                  onClick={() => setDeletingNote(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
} 