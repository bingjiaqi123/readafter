import { useState, useMemo, MouseEvent as ReactMouseEvent } from 'react';
import { ReadTagTree } from './ReadTagTree';
import { EditReadDialog } from './EditReadDialog';
import { EditTagsDialog } from '../EditTagsDialog';
import { DeleteDialog } from '../Manage/DeleteDialog';
import { Note, ReadList, ReadScheme, isReadSchemeWithNote } from '../../types/index';
import { AddToListsDialog } from './AddToListsDialog';
import { TextDeleteButton } from '../TextDeleteButton';
import { filterSchemes, FilteredScheme } from '../../utils/Read/readFilter';
import { TagDisplay } from '../TagDisplay';
import { ReadSearchBar } from './ReadSearchBar';

interface ReadPageProps {
  notes: Note[];
  readLists: ReadList[];
  readSchemes: ReadScheme[];
  onDeleteScheme: (noteId: string, schemeId: string) => void;
  onBatchDeleteSchemes: (schemeIds: string[]) => void;
  onCreateList: (name: string, schemes: { schemeId: string; noteId: string }[]) => void;
  onAddToExistingList: (listId: string, schemes: { schemeId: string; noteId: string }[]) => void;
  onEditReadScheme: (noteId: string, schemeId: string, text: string, title: string, isTitleEdited: boolean, tags: string[]) => void;
  onUpdateSchemeTags: (schemeIds: string[], tags: string[]) => void;
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
  onBatchDeleteSchemes,
  onCreateList,
  onAddToExistingList,
  onEditReadScheme,
  onUpdateSchemeTags,
}: ReadPageProps) {
  const [selectedSchemes, setSelectedSchemes] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [isAllSelectMode, setIsAllSelectMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showToListDialog, setShowToListDialog] = useState(false);
  const [showEditTagsDialog, setShowEditTagsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hideListedSchemes, setHideListedSchemes] = useState(false);
  const [schemeToEdit, setSchemeToEdit] = useState<SchemeToEdit | null>(null);
  const [newListName, setNewListName] = useState('');
  const [showTagTree, setShowTagTree] = useState(true);

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
    setIsMultiSelectMode(true);
    setIsAllSelectMode(false);
    setSelectedSchemes(new Set());
  };

  const handleAllSelectToggle = () => {
    setIsAllSelectMode(true);
    setIsMultiSelectMode(false);
    setSelectedSchemes(new Set(filteredSchemes.map(s => s.id)));
  };

  const handleCancelMultiSelect = () => {
    setIsMultiSelectMode(false);
    setIsAllSelectMode(false);
    setSelectedSchemes(new Set());
  };

  const handleSchemeSelect = (schemeId: string) => {
    if (!isMultiSelectMode && !isAllSelectMode) return;
    
    setSelectedSchemes(prev => {
      const next = new Set(prev);
      if (next.has(schemeId)) {
        next.delete(schemeId);
      } else {
        next.add(schemeId);
      }
      return next;
    });
  };

  const handleDeleteAll = () => {
    if (selectedSchemes.size === 0) return;
    setShowBatchDeleteDialog(true);
  };

  const handleBatchDeleteConfirm = (_deleteMode: 'note-only' | 'note-and-schemes') => {
    onBatchDeleteSchemes(Array.from(selectedSchemes));
    setSelectedSchemes(new Set());
    setIsMultiSelectMode(false);
    setIsAllSelectMode(false);
    setShowBatchDeleteDialog(false);
  };

  const handleBatchDeleteCancel = () => {
    setShowBatchDeleteDialog(false);
  };

  const handleRemoveAllLinks = () => {
    if (selectedSchemes.size === 0) return;
    if (window.confirm(`确定要移除选中的 ${selectedSchemes.size} 个跟读方案的笔记链接吗？`)) {
      // TODO: 实现移除链接功能
      console.log('移除链接功能待实现');
    }
  };

  const handleTagChange = () => {
    if (selectedSchemes.size === 0) return;
    setShowEditTagsDialog(true);
  };

  const handleTagsSave = (newTags: string[]) => {
    onUpdateSchemeTags(Array.from(selectedSchemes), newTags);
    setShowEditTagsDialog(false);
  };

  const handleTagsSaveWithDiff = (tagsToAdd: string[], tagsToRemove: string[]) => {
    // 处理标签不一致的情况
    selectedSchemes.forEach(schemeId => {
      const scheme = readSchemes.find(s => s.id === schemeId);
      if (scheme) {
        const currentTags = scheme.tags || [];
        // 移除要删除的标签
        const tagsAfterRemove = currentTags.filter(tag => !tagsToRemove.includes(tag));
        // 添加新标签
        const finalTags = [...new Set([...tagsAfterRemove, ...tagsToAdd])];
        onUpdateSchemeTags([schemeId], finalTags);
      }
    });
    setShowEditTagsDialog(false);
  };

  // 获取所有选中方案的标签
  const getAllSelectedSchemeTags = () => {
    const allTags = new Set<string>();
    selectedSchemes.forEach(schemeId => {
      const scheme = readSchemes.find(s => s.id === schemeId);
      if (scheme && scheme.tags) {
        scheme.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  };

  // 获取选中方案的初始标签（如果标签完全一致）
  const getInitialTags = () => {
    const selectedSchemeList = Array.from(selectedSchemes).map(schemeId => 
      readSchemes.find(s => s.id === schemeId)
    ).filter(Boolean) as ReadScheme[];
    
    if (selectedSchemeList.length === 0) return [];
    
    const firstSchemeTags = selectedSchemeList[0].tags || [];
    const allHaveSameTags = selectedSchemeList.every(scheme => {
      const schemeTags = scheme.tags || [];
      // 检查标签集合是否相同，与顺序无关
      return schemeTags.length === firstSchemeTags.length && 
             schemeTags.every(tag => firstSchemeTags.includes(tag)) &&
             firstSchemeTags.every(tag => schemeTags.includes(tag));
    });
    
    // 如果标签完全一致，返回第一个方案的标签；否则返回空数组
    return allHaveSameTags ? firstSchemeTags : [];
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
      <div className={`${showTagTree ? 'w-64' : 'w-16'} border-r border-gray-200 overflow-y-auto transition-all duration-300`}>
        <ReadTagTree
          items={readSchemes}
          onTagSelect={handleTagSelect}
          selectedTags={selectedTags}
          showTagTree={showTagTree}
          onToggleTagTree={setShowTagTree}
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
          isAllSelect={isAllSelectMode}
          onMultiSelectToggle={handleMultiSelectToggle}
          onAllSelectToggle={handleAllSelectToggle}
          onCancelMultiSelect={handleCancelMultiSelect}
          selectedSchemes={selectedSchemes}
          onAddToList={handleAddToList}
          onDeleteAll={handleDeleteAll}
          onRemoveAllLinks={handleRemoveAllLinks}
          onTagChange={handleTagChange}
        />

        {/* 方案列表 */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {filteredSchemes.map((scheme: FilteredScheme) => {
              const originalScheme = readSchemes.find(s => s.id === scheme.id);
              if (!originalScheme) return null;
              const isSelectMode = isMultiSelectMode || isAllSelectMode;
              return (
                <div
                  key={scheme.id}
                  className={`bg-white shadow rounded-lg overflow-hidden ${
                    selectedSchemes.has(scheme.id) ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => isSelectMode && handleSchemeSelect(scheme.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          {isSelectMode && (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedSchemes.has(scheme.id)}
                                onChange={() => handleSchemeSelect(scheme.id)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                onClick={e => e.stopPropagation()}
                                aria-label={`选择方案：${scheme.title || '独立跟读方案'}`}
                              />
                            </label>
                          )}
                          <h3 className="text-lg font-medium text-gray-900">
                            {scheme.title || (scheme.noteTitle ? scheme.noteTitle : '独立跟读方案')}
                          </h3>
                          {scheme.isInList && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              已加入 {readLists.filter(list => 
                                list.schemes.some((s: { schemeId: string }) => s.schemeId === scheme.id)
                              ).length} 个列表
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(scheme.timestamp).toLocaleString()}
                        </p>
                        {scheme.noteTitle && (
                          <p className="text-sm mt-1">
                            <span className="text-gray-500">笔记: </span>
                            <span className="text-pink-600">{scheme.noteTitle}</span>
                          </p>
                        )}
                        <div className="mt-2">
                          <TagDisplay tags={scheme.noteTags || []} />
                        </div>
                      </div>
                      {!isSelectMode && (
                        <div className="flex items-center space-x-2">
                          {originalScheme.noteId && (
                            <button
                              onClick={(e: ReactMouseEvent) => {
                                e.stopPropagation();
                                // TODO: 实现移除链接功能
                                console.log('移除链接功能待实现');
                              }}
                              className="px-3 py-1 text-orange-600 hover:text-orange-800"
                            >
                              移除链接
                            </button>
                          )}
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
                      )}
                    </div>
                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {scheme.text}
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
          initialTags={getInitialTags()}
        />
      )}

      {/* 编辑标签对话框 */}
      {showEditTagsDialog && (
        <EditTagsDialog
          isOpen={showEditTagsDialog}
          onClose={() => {
            setShowEditTagsDialog(false);
          }}
          onSave={handleTagsSave}
          onSaveWithDiff={handleTagsSaveWithDiff}
          initialTags={getInitialTags()}
          allTags={getAllSelectedSchemeTags()}
          itemCount={selectedSchemes.size}
          itemType="scheme"
        />
      )}

      {/* 批量删除确认对话框 */}
      <DeleteDialog
        isOpen={showBatchDeleteDialog}
        onClose={handleBatchDeleteCancel}
        onConfirm={handleBatchDeleteConfirm}
        itemCount={selectedSchemes.size}
        itemType="scheme"
        isBatchDelete={true}
      />
    </div>
  );
} 