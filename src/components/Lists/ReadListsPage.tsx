import React, { useState, useRef, useEffect } from 'react';
import { ReadList, Note, ReadScheme } from '../../types';
import { TextDeleteButton } from '../TextDeleteButton';
import { RepeatDialog } from './RepeatDialog';
import { deleteReadList } from '../../utils/Lists/listsDelete';
import { updateReadList } from '../../utils/Lists/listsUpdate';
import { ExpandMode } from './ExpandMode';
import { SortButton } from './SortButton';

interface ReadListsPageProps {
  items: Note[];
  readLists: ReadList[];
  readSchemes: ReadScheme[];
  onDeleteReadList: (listId: string, deleteMode: 'list-only' | 'unique-schemes' | 'all-schemes') => void;
  onCreateReadList: (name: string, selectedSchemes: Array<{ schemeId: string; noteId: string }>) => void;
  onUpdateListName?: (listId: string, newName: string) => void;
  onUpdateSchemeOrder?: (listId: string, schemeId: string, newOrder: number) => void;
}

export function ReadListsPage({ 
  items, 
  readLists, 
  readSchemes,
  onDeleteReadList, 
  onCreateReadList,
  onUpdateListName,
  onUpdateSchemeOrder
}: ReadListsPageProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [showDeleteSchemeDialog, setShowDeleteSchemeDialog] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<{ listId: string; schemeId: string; } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
  const [isRepeatDialogOpen, setIsRepeatDialogOpen] = useState(false);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateReadList(newListName.trim(), []);
      setShowCreateDialog(false);
      setNewListName('');
    }
  };

  const handleStartRead = (listId: string) => {
    setCurrentListId(listId);
    setIsRepeatDialogOpen(true);
  };

  const handleReadComplete = () => {
    setCurrentListId(null);
  };

  // 获取列表中的有效方案数量（过滤掉已被删除的方案）
  const getValidSchemeCount = (list: ReadList) => {
    return list.schemes.filter(scheme => 
      readSchemes.some(s => s.id === scheme.schemeId)
    ).length;
  };

  const toggleListExpand = (listId: string) => {
    setExpandedLists(prev => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
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

    let newOrder: number;
    switch (direction) {
      case 'top':
        newOrder = 0;
        break;
      case 'up':
        if (currentIndex === 0) return;
        // 交换当前方案和上一个方案的顺序
        const prevScheme = schemes[currentIndex - 1];
        onUpdateSchemeOrder(listId, prevScheme.schemeId, schemes[currentIndex].order);
        newOrder = prevScheme.order;
        break;
      case 'down':
        if (currentIndex === schemes.length - 1) return;
        // 交换当前方案和下一个方案的顺序
        const nextScheme = schemes[currentIndex + 1];
        onUpdateSchemeOrder(listId, nextScheme.schemeId, schemes[currentIndex].order);
        newOrder = nextScheme.order;
        break;
      case 'bottom':
        newOrder = schemes[schemes.length - 1].order + 1;
        break;
    }

    onUpdateSchemeOrder(listId, schemeId, newOrder);
  };

  const handleDeleteSchemeClick = (listId: string, schemeId: string) => {
    setSchemeToDelete({ listId, schemeId });
    setShowDeleteSchemeDialog(true);
  };

  const handleDeleteSchemeConfirm = () => {
    if (schemeToDelete && onUpdateSchemeOrder) {
      onUpdateSchemeOrder(schemeToDelete.listId, schemeToDelete.schemeId, -1);
      setShowDeleteSchemeDialog(false);
      setSchemeToDelete(null);
    }
  };

  const handleDeleteSchemeCancel = () => {
    setShowDeleteSchemeDialog(false);
    setSchemeToDelete(null);
  };

  return (
    <div className="p-6">

      <div className="space-y-4">
        {readLists.map((list) => (
          <div
            key={list.id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:border-gray-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ExpandMode
                  isExpanded={expandedLists.has(list.id)}
                  onToggle={() => toggleListExpand(list.id)}
                />
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
                  onClick={() => handleStartRead(list.id)}
                  className="px-3 py-1 text-indigo-600 hover:text-indigo-800"
                >
                  跟读
                </button>
                <TextDeleteButton
                  onClick={() => handleDeleteClick(list)}
                  className="px-3 py-1"
                >
                  删除列表
                </TextDeleteButton>
              </div>
            </div>

            {!expandedLists.has(list.id) ? (
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
            ) : (
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