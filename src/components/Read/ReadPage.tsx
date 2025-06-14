import { useState, useMemo, MouseEvent as ReactMouseEvent } from 'react';
import { ReadTagTree } from './ReadTagTree';
import { EditReadDialog } from './EditReadDialog';
import { Note, ReadList, ReadScheme, isReadSchemeWithNote } from '../../types/index';
import { AddToListsDialog } from './AddToListsDialog';
import { TextDeleteButton } from '../TextDeleteButton';
import { filterSchemes, FilteredScheme } from '../../utils/Read/readFilter';
import { TagDisplay } from './TagDisplay';
import { ReadSearchBar } from './ReadSearchBar';

interface ReadPageProps {
  notes: Note[];
  readLists: ReadList[];
  readSchemes: ReadScheme[];
  onDeleteScheme: (noteId: string, schemeId: string) => void;
  onCreateList: (name: string, schemes: { schemeId: string; noteId: string }[]) => void;
  onAddToExistingList: (listId: string, schemes: { schemeId: string; noteId: string }[]) => void;
  onEditReadScheme: (noteId: string, schemeId: string, text: string, title: string, isTitleEdited: boolean, tags: string[]) => void;
}

interface SchemeToEdit {
  noteId: string;
  schemeId: string;
  text: string;
  title: string;
  isTitleEdited: boolean;
}

export function ReadPage({
  notes,
  readLists,
  readSchemes,
  onDeleteScheme,
  onCreateList,
  onAddToExistingList,
  onEditReadScheme,
}: ReadPageProps) {
  const [selectedSchemes, setSelectedSchemes] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showToListDialog, setShowToListDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hideListedSchemes, setHideListedSchemes] = useState(false);
  const [schemeToEdit, setSchemeToEdit] = useState<SchemeToEdit | null>(null);
  const [newListName, setNewListName] = useState('');

  // 获取所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    readSchemes.forEach((scheme: ReadScheme) => {
      (scheme.tags || []).forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [readSchemes]);

  // 过滤方案
  const filteredSchemes: FilteredScheme[] = useMemo(() => {
    return filterSchemes(
      notes,
      readLists,
      readSchemes,
      hideListedSchemes,
      searchTerm,
      selectedTags.join(',')
    );
  }, [notes, readLists, readSchemes, hideListedSchemes, searchTerm, selectedTags]);

  // 多选/全选
  const handleMultiSelectToggle = () => {
    if (isMultiSelectMode) {
      setIsMultiSelectMode(false);
      setSelectedSchemes(new Set());
      setIsAllSelected(false);
    } else {
      setIsMultiSelectMode(true);
    }
  };
  const handleSchemeSelect = (schemeId: string) => {
    setSelectedSchemes(prev => {
      const next = new Set(prev);
      if (next.has(schemeId)) {
        next.delete(schemeId);
      } else {
        next.add(schemeId);
      }
      setIsAllSelected(next.size === filteredSchemes.length);
      return next;
    });
  };
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSchemes(new Set());
      setIsAllSelected(false);
    } else {
      setSelectedSchemes(new Set(filteredSchemes.map(s => s.id)));
      setIsAllSelected(true);
    }
  };

  // 删除
  const [deleteTarget, setDeleteTarget] = useState<{noteId: string, schemeId: string} | null>(null);
  const handleDeleteClick = (noteId: string, schemeId: string) => {
    setDeleteTarget({ noteId, schemeId });
    setShowDeleteDialog(true);
  };
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDeleteScheme(deleteTarget.noteId, deleteTarget.schemeId);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  // 编辑
  const handleEditClick = (
    noteId: string | undefined,
    schemeId: string,
    text: string,
    title: string,
    isTitleEdited: boolean
  ) => {
    setSchemeToEdit({
      noteId: noteId || '',
      schemeId,
      text,
      title,
      isTitleEdited
    });
    setShowEditDialog(true);
  };
  const handleEditSubmit = (text: string, title: string, isTitleEdited: boolean, tags: string[]) => {
    if (schemeToEdit) {
      onEditReadScheme(
        schemeToEdit.noteId,
        schemeToEdit.schemeId,
        text,
        title,
        isTitleEdited,
        tags
      );
      setSchemeToEdit(null);
      setShowEditDialog(false);
    }
  };

  // 批量加入列表
  const handleAddToList = () => {
    if (selectedSchemes.size === 0) return;
    setShowToListDialog(true);
  };
  const handleListSelect = (listId: string) => {
    onAddToExistingList(listId, Array.from(selectedSchemes).map(schemeId => {
      const scheme = readSchemes.find(s => s.id === schemeId);
      return {
        schemeId,
        noteId: scheme && isReadSchemeWithNote(scheme) ? scheme.noteId : ''
      };
    }));
    setSelectedSchemes(new Set());
    setNewListName("");
    setShowToListDialog(false);
  };
  const handleCreateList = () => {
    if (selectedSchemes.size === 0 || !newListName.trim()) return;
    const schemes = Array.from(selectedSchemes).map(schemeId => {
      const scheme = readSchemes.find(s => s.id === schemeId);
      return {
        schemeId: schemeId,
        noteId: scheme && isReadSchemeWithNote(scheme) && scheme.noteId ? scheme.noteId : ''
      };
    });
    onCreateList(newListName.trim(), schemes);
    setShowToListDialog(false);
    setSelectedSchemes(new Set());
    setSelectedTags([]);
    setNewListName('');
  };

  // 标签选择
  const handleTagSelect = (tagPath: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagPath)) {
        return prev.filter(tag => tag !== tagPath);
      } else {
        return [...prev, tagPath];
      }
    });
  };

  return (
    <div className="flex h-full">
      {/* 左侧标签树 */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-4">
        <ReadTagTree
          allTags={allTags}
          onTagSelect={handleTagSelect}
          selectedTags={selectedTags}
          style="indigo"
          schemes={readSchemes}
        />
      </div>

      {/* 右侧内容 */}
      <div className="flex-1 flex flex-col">
        {/* 搜索栏 */}
        <ReadSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          hideSchemedNotes={hideListedSchemes}
          onHideSchemedChange={setHideListedSchemes}
          isMultiSelect={isMultiSelectMode}
          onMultiSelectToggle={handleMultiSelectToggle}
          selectedSchemes={selectedSchemes}
          onAddToList={handleAddToList}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
        />

        {/* 方案列表 */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {filteredSchemes.map((scheme: FilteredScheme) => {
              const originalScheme = readSchemes.find(s => s.id === scheme.id);
              if (!originalScheme) return null;
              return (
                <div
                  key={scheme.id}
                  className={`bg-white shadow rounded-lg overflow-hidden ${
                    selectedSchemes.has(scheme.id) ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => isMultiSelectMode && handleSchemeSelect(scheme.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {scheme.title || (scheme.noteTitle ? scheme.noteTitle : '独立跟读方案')}
                        </h3>
                        {scheme.noteTitle && (
                          <p className="text-sm mt-1">
                            <span className="text-gray-500">笔记: </span>
                            <span className="text-pink-600">{scheme.noteTitle}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e: ReactMouseEvent) => {
                            e.stopPropagation();
                            handleEditClick(
                              originalScheme.noteId,
                              originalScheme.id,
                              originalScheme.text,
                              originalScheme.title || '',
                              originalScheme.isTitleEdited || false
                            );
                          }}
                          className="px-3 py-1 text-blue-600 hover:text-blue-800"
                        >
                          编辑
                        </button>
                        <TextDeleteButton
                          onClick={(e?: ReactMouseEvent) => {
                            if (e) e.stopPropagation();
                            handleDeleteClick(originalScheme.noteId || '', originalScheme.id);
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(scheme.timestamp).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap text-gray-700 mb-4 mt-2">
                      {scheme.text}
                    </p>
                    <div className="flex flex-col space-y-2">
                      <TagDisplay tags={scheme.noteTags || []} />
                      {scheme.isInList && (
                        <span className="text-sm text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded inline-block">
                          已加入 {readLists.filter(list => 
                            list.schemes.some((s: { schemeId: string }) => s.schemeId === scheme.id)
                          ).length} 个列表
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">确认删除</h3>
            <p className="mb-4">确定要删除这个跟读方案吗？</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                取消
              </button>
              <TextDeleteButton
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除
              </TextDeleteButton>
            </div>
          </div>
        </div>
      )}

      {/* 批量加入列表弹窗 */}
      {showToListDialog && (
        <AddToListsDialog
          isOpen={showToListDialog}
          onClose={() => {
            setShowToListDialog(false);
            setNewListName('');
          }}
          readLists={readLists}
          selectedSchemes={Array.from(selectedSchemes).map(schemeId => {
            const scheme = readSchemes.find(s => s.id === schemeId);
            return {
              schemeId,
              noteId: scheme && isReadSchemeWithNote(scheme) ? scheme.noteId : ''
            };
          })}
          onAddToList={handleListSelect}
          onCreateList={handleCreateList}
          newListName={newListName}
          onNewListNameChange={setNewListName}
        />
      )}

      {/* 编辑对话框 */}
      {schemeToEdit && (
        <EditReadDialog
          isOpen={showEditDialog}
          onClose={() => {
            setSchemeToEdit(null);
            setShowEditDialog(false);
          }}
          onSave={handleEditSubmit}
          initialText={schemeToEdit.text}
          initialTitle={schemeToEdit.title}
          initialIsTitleEdited={schemeToEdit.isTitleEdited}
          initialTags={readSchemes.find(s => s.id === schemeToEdit.schemeId)?.tags || []}
        />
      )}
    </div>
  );
} 