import { useState, useMemo } from 'react';
import { ManageTagTree } from './ManageTagTree';
import { ManageNoteList } from './ManageNoteList';
import { ManageSearchBar } from './ManageSearchBar';
import { Note, ReadScheme } from '../../types';
import '../../styles/components/common.css';

interface ManagePageProps {
  notes: Note[];
  readSchemes: ReadScheme[];
  onSearchChange: (term: string) => void;
  hideSchemedNotes: boolean;
  onHideSchemedNotesChange: (hide: boolean) => void;
  onAddScheme: (noteIds: string[]) => void;
}

export function ManagePage({
  notes,
  readSchemes,
  onSearchChange,
  hideSchemedNotes,
  onHideSchemedNotesChange,
  onAddScheme
}: ManagePageProps) {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddToList = () => {
    if (selectedNotes.size === 0) return;
    onAddScheme(Array.from(selectedNotes));
    setSelectedNotes(new Set());
    setIsMultiSelect(false);
  };

  const filteredItems = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = selectedTag === '' || note.tags.includes(selectedTag);
      
      const matchesScheme = !hideSchemedNotes || !readSchemes.some(scheme => 
        scheme.noteId === note.id
      );
      
      return matchesSearch && matchesTag && matchesScheme;
    });
  }, [notes, searchTerm, selectedTag, hideSchemedNotes, readSchemes]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onSearchChange(term);
  };

  const handleTagSelect = (path: string) => {
    setSelectedTag(path);
  };

  const handleMultiSelectToggle = () => {
    setIsMultiSelect(!isMultiSelect);
    if (!isMultiSelect) {
      setSelectedNotes(new Set());
    }
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === filteredItems.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(filteredItems.map(note => note.id)));
    }
  };

  const handleNoteSelect = (noteId: string) => {
    if (!isMultiSelect) return;
    
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200 overflow-y-auto">
        <ManageTagTree
          items={notes}
          onTagSelect={handleTagSelect}
          selectedTags={selectedTag ? [selectedTag] : []}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <ManageSearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          hideSchemedNotes={hideSchemedNotes}
          onHideSchemedChange={onHideSchemedNotesChange}
          isMultiSelect={isMultiSelect}
          onMultiSelectToggle={handleMultiSelectToggle}
          selectedNotes={selectedNotes}
          onSelectAll={handleSelectAll}
          isAllSelected={selectedNotes.size === filteredItems.length}
          onAddToList={handleAddToList}
        />
        <div className="flex-1 overflow-y-auto">
          <ManageNoteList
            items={filteredItems}
            readSchemes={readSchemes}
            onSearchChange={handleSearchChange}
            hideSchemedNotes={hideSchemedNotes}
            onHideSchemedChange={onHideSchemedNotesChange}
            isMultiSelect={isMultiSelect}
            selectedNotes={selectedNotes}
            onNoteSelect={handleNoteSelect}
          />
        </div>
      </div>
    </div>
  );
} 