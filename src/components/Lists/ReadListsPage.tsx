import React, { useState, useRef } from 'react';
import { ReadList, ReadScheme } from '../../types';
import { TextDeleteButton } from '../TextDeleteButton';
import { RepeatDialog } from './RepeatDialog';
import { ExpandMode } from './ExpandMode';
import { SortButton } from './SortButton';

interface ReadListsPageProps {
  readLists: ReadList[];
  readSchemes: ReadScheme[];
  onDeleteReadList: (listId: string, deleteMode: 'list-only' | 'unique-schemes' | 'all-schemes') => void;
  onUpdateListName: (listId: string, newName: string) => void;
  onUpdateSchemeOrder: (listId: string, schemeIds: string[]) => void;
  onAddToExistingList: (listId: string, schemes: { schemeId: string; noteId: string }[]) => void;
  onDeleteScheme: (listId: string, schemeId: string) => void;
  onEditReadScheme: (listId: string, schemeId: string, text: string, title: string, isTitleEdited: boolean) => void;
  onToggleListPin?: (listId: string) => void;
}

export function ReadListsPage({ 
  readLists, 
  readSchemes,
  onDeleteReadList, 
  onUpdateListName,
  onUpdateSchemeOrder,
  onToggleListPin
}: ReadListsPageProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [showDeleteSchemeDialog, setShowDeleteSchemeDialog] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<{ listId: string; schemeId: string; } | null>(null);
  const [listModes, setListModes] = useState<Map<string, 'title-only' | 'collapsed' | 'expanded'>>(new Map());
  const [isRepeatDialogOpen, setIsRepeatDialogOpen] = useState(false);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // 获取列表的模式
  const getListMode = (listId: string): 'title-only' | 'collapsed' | 'expanded' => {
    return listModes.get(listId) || 'title-only';
  };

  // 处理列表点击
  const handleListClick = (listId: string) => {
    const currentMode = getListMode(listId);
    
    // 如果当前是仅标题模式，点击后变为折叠模式
    if (currentMode === 'title-only') {
      // 先将所有列表设为仅标题模式
      const newModes = new Map<string, 'title-only' | 'collapsed' | 'expanded'>();
      readLists.forEach(list => {
        newModes.set(list.id, 'title-only');
      });
      // 然后将点击的列表设为折叠模式
      newModes.set(listId, 'collapsed');
      setListModes(newModes);
    }
  };

  // 处理展开/折叠按钮点击
  const handleToggleExpand = (listId: string) => {
    const currentMode = getListMode(listId);
    
    if (currentMode === 'collapsed') {
      // 从折叠模式切换到展开模式
      setListModes(prev => new Map(prev).set(listId, 'expanded'));
    } else if (currentMode === 'expanded') {
      // 从展开模式切换到折叠模式
      setListModes(prev => new Map(prev).set(listId, 'collapsed'));
    }
  };

  const handleDeleteClick = (list: ReadList) => {
    setListToDelete(list.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = (deleteMode: 'list-only' | 'unique-schemes' | 'all-schemes') => {
    if (listToDelete) {
      onDeleteReadList(listToDelete, deleteMode);
      setShowDeleteDialog(false);
      setListToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setListToDelete(null);
  };

  const handleStartRead = (listId: string) => {
    setCurrentListId(listId);
    setIsRepeatDialogOpen(true);
  };

  const handleDeleteSchemeClick = (listId: string, schemeId: string) => {
    setSchemeToDelete({ listId, schemeId });
    setShowDeleteSchemeDialog(true);
  };

  const handleDeleteSchemeConfirm = () => {
    if (schemeToDelete && onUpdateSchemeOrder) {
      onUpdateSchemeOrder(schemeToDelete.listId, [schemeToDelete.schemeId]);
      setShowDeleteSchemeDialog(false);
      setSchemeToDelete(null);
    }
  };

  const handleDeleteSchemeCancel = () => {
    setShowDeleteSchemeDialog(false);
    setSchemeToDelete(null);
  };

  // 处理列表标题编辑
  const handleListTitleDoubleClick = (list: ReadList) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
    // 在下一个渲染周期聚焦输入框
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const handleListTitleBlur = () => {
    if (editingListId && editingListName && onUpdateListName) {
      onUpdateListName(editingListId, editingListName);
    }
    setEditingListId(null);
  };

  const handleListTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleListTitleBlur();
    } else if (e.key === 'Escape') {
      setEditingListId(null);
    }
  };

  // 处理方案排序
  const handleMoveScheme = (listId: string, schemeId: string, direction: 'top' | 'up' | 'down' | 'bottom') => {
    if (!onUpdateSchemeOrder) return;
    
    const list = readLists.find(l => l.id === listId);
    if (!list) return;

    const schemes = [...list.schemes].sort((a, b) => a.order - b.order);
    const currentIndex = schemes.findIndex(s => s.schemeId === schemeId);
    if (currentIndex === -1) return;

    let schemeIds: string[];
    switch (direction) {
      case 'top':
        schemeIds = [schemeId, ...schemes.filter(s => s.schemeId !== schemeId).map(s => s.schemeId)];
        break;
      case 'up':
        if (currentIndex === 0) return;
        schemeIds = [
          ...schemes.slice(0, currentIndex - 1).map(s => s.schemeId),
          schemeId,
          schemes[currentIndex - 1].schemeId,
          ...schemes.slice(currentIndex + 1).map(s => s.schemeId)
        ];
        break;
      case 'down':
        if (currentIndex === schemes.length - 1) return;
        schemeIds = [
          ...schemes.slice(0, currentIndex).map(s => s.schemeId),
          schemes[currentIndex + 1].schemeId,
          schemeId,
          ...schemes.slice(currentIndex + 2).map(s => s.schemeId)
        ];
        break;
      case 'bottom':
        schemeIds = [...schemes.filter(s => s.schemeId !== schemeId).map(s => s.schemeId), schemeId];
        break;
      default:
        return;
    }

    onUpdateSchemeOrder(listId, schemeIds);
  };

  const handleTogglePin = (listId: string) => {
    if (onToggleListPin) {
      onToggleListPin(listId);
    }
  };

  // 对列表进行排序：置顶的在前，未置顶的在后
  const sortedLists = [...readLists].sort((a, b) => {
    const aPinned = a.isPinned || false;
    const bPinned = b.isPinned || false;
    if (aPinned === bPinned) return 0;
    return aPinned ? -1 : 1;
  });

  return (
    <div className="p-6">

      <div className="space-y-4">
        {sortedLists.map((list) => (
          <div
            key={list.id}
            className={`border rounded-lg p-4 bg-white shadow-sm hover:border-gray-300 cursor-pointer ${
              list.isPinned ? 'border-yellow-300 bg-yellow-50' : ''
            }`}
            onClick={() => handleListClick(list.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ExpandMode
                  mode={getListMode(list.id)}
                  onToggle={() => handleToggleExpand(list.id)}
                />
                {list.isPinned && (
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                )}
                {editingListId === list.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingListName}
                    onChange={(e) => setEditingListName(e.target.value)}
                    onBlur={handleListTitleBlur}
                    onKeyDown={handleListTitleKeyDown}
                    className="text-xl font-semibold px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="编辑列表名称"
                    placeholder="输入列表名称"
                    title="编辑列表名称"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3
                    className="text-xl font-semibold cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleListTitleDoubleClick(list);
                    }}
                  >
                    {list.name}
                  </h3>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartRead(list.id);
                  }}
                  className="px-3 py-1 text-indigo-600 hover:text-indigo-800"
                >
                  跟读
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePin(list.id);
                  }}
                  className={`px-3 py-1 rounded hover:bg-gray-100 ${
                    list.isPinned ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title={list.isPinned ? "取消置顶" : "置顶"}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                </button>
                <TextDeleteButton
                  onClick={(e) => {
                    if (e) e.stopPropagation();
                    handleDeleteClick(list);
                  }}
                  className="px-3 py-1"
                >
                  删除列表
                </TextDeleteButton>
              </div>
            </div>

            {/* 仅标题模式：不显示任何方案 */}
            {getListMode(list.id) === 'title-only' && null}

            {/* 折叠模式：显示方案标题 */}
            {getListMode(list.id) === 'collapsed' && (
              <div className="space-y-2">
                {list.schemes
                  .sort((a, b) => a.order - b.order)
                  .map((scheme) => {
                    const schemeInfo = readSchemes.find(s => s.id === scheme.schemeId);
                    if (!schemeInfo) return null;

                    return (
                      <div
                        key={scheme.schemeId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{schemeInfo.title}</div>
                        </div>
                        <SortButton
                          onMove={(direction) => handleMoveScheme(list.id, scheme.schemeId, direction)}
                          onRemove={() => handleDeleteSchemeClick(list.id, scheme.schemeId)}
                        />
                      </div>
                    );
                  })}
              </div>
            )}

            {/* 展开模式：显示完整方案信息 */}
            {getListMode(list.id) === 'expanded' && (
              <div className="space-y-2">
                {list.schemes
                  .sort((a, b) => a.order - b.order)
                  .map((scheme) => {
                    const schemeInfo = readSchemes.find(s => s.id === scheme.schemeId);
                    if (!schemeInfo) return null;

                    return (
                      <div
                        key={scheme.schemeId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{schemeInfo.title}</div>
                          <div className="text-sm text-gray-500">
                            创建于 {new Date(schemeInfo.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            在 {readLists.filter(l => 
                              l.schemes.some(s => s.schemeId === scheme.schemeId)
                            ).length} 个列表中使用
                          </div>
                          <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                            {schemeInfo.text}
                          </div>
                        </div>
                        <SortButton
                          onMove={(direction) => handleMoveScheme(list.id, scheme.schemeId, direction)}
                          onRemove={() => handleDeleteSchemeClick(list.id, scheme.schemeId)}
                        />
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">确认删除</h3>
            <p className="mb-4">请选择删除方式：</p>
            <div className="space-y-2">
              <button
                onClick={() => handleDeleteConfirm('list-only')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                仅删除列表
              </button>
              <button
                onClick={() => handleDeleteConfirm('unique-schemes')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除列表和仅在该列表中的跟读方案
              </button>
              <button
                onClick={() => handleDeleteConfirm('all-schemes')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除列表和所有相关的跟读方案
              </button>
              <button
                onClick={handleDeleteCancel}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除方案确认对话框 */}
      {showDeleteSchemeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">确认删除</h3>
            <p className="mb-4">确定要从列表中移除这个跟读方案吗？</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteSchemeCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleDeleteSchemeConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repeat Dialog */}
      {isRepeatDialogOpen && currentListId && (
        <RepeatDialog
          listId={currentListId}
          onClose={() => {
            setIsRepeatDialogOpen(false);
            setCurrentListId(null);
          }}
          readLists={readLists}
          allSchemes={readSchemes.map(scheme => ({
            id: scheme.id,
            text: scheme.text,
            noteTitle: scheme.title
          }))}
        />
      )}
    </div>
  );
} 