import { Note, ReadScheme } from '../../types';

interface ManageNoteListProps {
  items: Note[];
  readSchemes: ReadScheme[];
  onSearchChange?: (term: string) => void;
  hideSchemedNotes: boolean;
  onHideSchemedChange: (hide: boolean) => void;
  isMultiSelect: boolean;
  selectedNotes: Set<string>;
  onNoteSelect: (noteId: string) => void;
}

export function ManageNoteList({
  items,
  readSchemes,
  isMultiSelect,
  selectedNotes,
  onNoteSelect
}: ManageNoteListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {items.map(note => {
        const hasScheme = readSchemes.some(scheme => scheme.noteId === note.id);
        return (
          <div
            key={note.id}
            onClick={() => isMultiSelect && onNoteSelect(note.id)}
            className={`p-4 border rounded-lg ${
              isMultiSelect
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
                  {isMultiSelect && (
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
    </div>
  );
} 