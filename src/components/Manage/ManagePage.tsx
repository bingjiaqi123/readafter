import { useState, useMemo } from 'react';
import { ManageTagTree } from './ManageTagTree';
import { ManageNoteList } from './ManageNoteList';
import { ManageSearchBar } from './ManageSearchBar';
import { EditTagsDialog } from '../EditTagsDialog';
import { DeleteDialog } from './DeleteDialog';
import { Note, ReadScheme } from '../../types';
import '../../styles/components/common.css';

interface ManagePageProps {
  notes: Note[];
  readSchemes: ReadScheme[];
  onSearchChange: (term: string) => void;
  hideSchemedNotes: boolean;
  onHideSchemedNotesChange: (hide: boolean) => void;
  onAddScheme: (noteIds: string[]) => void;
  onEditNote: (noteId: string, title: string, content: string, tags: string[]) => void;
  onDeleteNote: (noteId: string, deleteMode: 'note-only' | 'note-and-schemes') => void;
  onBatchDeleteNotes: (noteIds: string[], deleteMode: 'note-only' | 'note-and-schemes') => void;
  onAddReadScheme: (noteId: string, text: string, title?: string) => void;
  onUpdateNoteTags: (noteIds: string[], tags: string[]) => void;
}

export function ManagePage({
  notes,
  readSchemes,
  onSearchChange,
  hideSchemedNotes,
  onHideSchemedNotesChange,
  onAddScheme,
  onEditNote,
  onDeleteNote,
  onBatchDeleteNotes,
  onAddReadScheme,
  onUpdateNoteTags
}: ManagePageProps) {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isAllSelect, setIsAllSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditTagsDialog, setShowEditTagsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAddToList = () => {
    if (selectedNotes.size === 0) return;
    onAddScheme(Array.from(selectedNotes));
    setSelectedNotes(new Set());
    setIsMultiSelect(false);
    setIsAllSelect(false);
  };

  const handleDeleteAll = () => {
    if (selectedNotes.size === 0) return;
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = (deleteMode: 'note-only' | 'note-and-schemes') => {
    onBatchDeleteNotes(Array.from(selectedNotes), deleteMode);
    setSelectedNotes(new Set());
    setIsMultiSelect(false);
    setIsAllSelect(false);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleTagChange = () => {
    if (selectedNotes.size === 0) return;
    setShowEditTagsDialog(true);
  };

  const handleTagsSave = (newTags: string[]) => {
    onUpdateNoteTags(Array.from(selectedNotes), newTags);
    setShowEditTagsDialog(false);
  };

  const handleTagsSaveWithDiff = (tagsToAdd: string[], tagsToRemove: string[]) => {
    // 处理标签不一致的情况
    selectedNotes.forEach(noteId => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        const currentTags = note.tags || [];
        // 移除要删除的标签
        const tagsAfterRemove = currentTags.filter(tag => !tagsToRemove.includes(tag));
        // 添加新标签
        const finalTags = [...new Set([...tagsAfterRemove, ...tagsToAdd])];
        onUpdateNoteTags([noteId], finalTags);
      }
    });
    setShowEditTagsDialog(false);
  };

  // 获取所有选中笔记的标签
  const getAllSelectedNoteTags = () => {
    const allTags = new Set<string>();
    selectedNotes.forEach(noteId => {
      const note = notes.find(n => n.id === noteId);
      if (note && note.tags) {
        note.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  };

  // 获取选中笔记的初始标签（如果标签完全一致）
  const getInitialTags = () => {
    const selectedNoteList = Array.from(selectedNotes).map(noteId => 
      notes.find(n => n.id === noteId)
    ).filter(Boolean) as Note[];
    
    if (selectedNoteList.length === 0) return [];
    
    const firstNoteTags = selectedNoteList[0].tags || [];
    const allHaveSameTags = selectedNoteList.every(note => {
      const noteTags = note.tags || [];
      // 检查标签集合是否相同，与顺序无关
      return noteTags.length === firstNoteTags.length && 
             noteTags.every(tag => firstNoteTags.includes(tag)) &&
             firstNoteTags.every(tag => noteTags.includes(tag));
    });
    
    // 如果标签完全一致，返回第一个笔记的标签；否则返回空数组
    return allHaveSameTags ? firstNoteTags : [];
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
    setIsMultiSelect(true);
    setIsAllSelect(false);
    setSelectedNotes(new Set());
  };

  const handleAllSelectToggle = () => {
    setIsAllSelect(true);
    setIsMultiSelect(false);
    setSelectedNotes(new Set(filteredItems.map(note => note.id)));
  };

  const handleCancelMultiSelect = () => {
    setIsMultiSelect(false);
    setIsAllSelect(false);
    setSelectedNotes(new Set());
  };

  const handleNoteSelect = (noteId: string) => {
    if (!isMultiSelect && !isAllSelect) return;
    
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
          isAllSelect={isAllSelect}
          onMultiSelectToggle={handleMultiSelectToggle}
          onAllSelectToggle={handleAllSelectToggle}
          onCancelMultiSelect={handleCancelMultiSelect}
          selectedNotes={selectedNotes}
          onAddToList={handleAddToList}
          onDeleteAll={handleDeleteAll}
          onTagChange={handleTagChange}
        />
        <div className="flex-1 overflow-y-auto">
          <ManageNoteList
            items={filteredItems}
            readSchemes={readSchemes}
            onSearchChange={handleSearchChange}
            hideSchemedNotes={hideSchemedNotes}
            onHideSchemedChange={onHideSchemedNotesChange}
            isMultiSelect={isMultiSelect}
            isAllSelect={isAllSelect}
            selectedNotes={selectedNotes}
            onNoteSelect={handleNoteSelect}
            onEditNote={onEditNote}
            onDeleteNote={onDeleteNote}
            onAddReadScheme={onAddReadScheme}
          />
        </div>
      </div>

      {/* 标签变更对话框 */}
      <EditTagsDialog
        isOpen={showEditTagsDialog}
        onClose={() => setShowEditTagsDialog(false)}
        onSave={handleTagsSave}
        onSaveWithDiff={handleTagsSaveWithDiff}
        initialTags={getInitialTags()}
        allTags={getAllSelectedNoteTags()}
        itemCount={selectedNotes.size}
        itemType="note"
      />

      {/* 删除确认对话框 */}
      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemCount={selectedNotes.size}
        itemType="note"
        isBatchDelete={true}
      />
    </div>
  );
} 