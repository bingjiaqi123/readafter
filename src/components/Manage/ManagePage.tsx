import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AddReadDialog } from './AddReadDialog';
import { EditNoteDialog } from './EditNoteDialog';
import { EditReadDialog } from '../Read/EditReadDialog';
import { Note, ReadScheme } from '../../types/index';
import { ManageTagTree } from './ManageTagTree';
import { deleteNote } from '../../utils/Manage/manageDelete';
import { buildTagTree, getItemsByTag, TagNode } from '../../utils/Manage/manageTagTree';
import { TextDeleteButton } from '../TextDeleteButton';
import { filterNotes, filterNotesByTag } from '../../utils/Manage/manageFilter';
import { TagDisplay } from '../Read/TagDisplay';
import { ManageSearchBar } from './ManageSearchBar';
import { processText } from '../../utils/Segment/processFlow';

interface ManagePageProps {
  notes: Note[];
  readSchemes: ReadScheme[];
  onEdit: (id: string, title: string, content: string, tags: string[]) => void;
  onDelete: (id: string, deleteReadSchemes: boolean) => void;
  onDeleteScheme: (noteId: string, schemeId: string) => void;
  onEditReadScheme: (noteId: string, schemeId: string, text: string, title: string, isTitleEdited: boolean, tags: string[]) => void;
  onAddReadScheme: (noteId: string, text: string, title?: string) => void;
}

export function ManagePage({
  notes,
  readSchemes,
  onEdit,
  onDelete,
  onDeleteScheme,
  onEditReadScheme,
  onAddReadScheme
}: ManagePageProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddReadDialogOpen, setIsAddReadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hideSchemedNotes, setHideSchemedNotes] = useState(false);
  const [showDeleteSchemeDialog, setShowDeleteSchemeDialog] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<{ noteId: string; schemeId: string } | null>(null);
  const [showEditSchemeDialog, setShowEditSchemeDialog] = useState(false);
  const [schemeToEdit, setSchemeToEdit] = useState<ReadScheme | null>(null);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });

  // 获取所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      (note.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // 构建标签树
  const tagTree = useMemo(() => {
    const items = allTags.map(tag => ({ id: tag, tags: [tag] }));
    return buildTagTree(items);
  }, [allTags]);

  // 根据选中的标签过滤笔记
  const filteredItems = useMemo(() => {
    // 应用过滤条件
    let filtered = notes;
    
    // 过滤已添加跟读方案的笔记
    if (hideSchemedNotes) {
      filtered = filtered.filter(note => 
        !readSchemes.some(scheme => scheme.noteId === note.id)
      );
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          (item.tags || []).some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
          readSchemes.some(
            (scheme) =>
              scheme.noteId === item.id &&
              ((scheme.title?.toLowerCase() || '').includes(searchLower) ||
              scheme.text.toLowerCase().includes(searchLower))
          )
      );
    }

    // 根据选中的标签过滤
    if (selectedTag) {
      filtered = filterNotesByTag(filtered, selectedTag, readSchemes);
    }
    
    return filtered;
  }, [notes, readSchemes, searchTerm, hideSchemedNotes, selectedTag]);

  const handleTagSelect = (path: string) => {
    setSelectedTag(path === selectedTag ? null : path);
  };

  const handleCreateClick = (note: Note) => {
    setCurrentNote(note);
    setIsAddReadDialogOpen(true);
  };

  const handleEditClick = (note: Note) => {
    setCurrentNote(note);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setNoteToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleManageDeleteConfirm = (deleteReadSchemes: boolean) => {
    if (noteToDelete) {
      onDelete(noteToDelete, deleteReadSchemes);
      setShowDeleteDialog(false);
      setNoteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setNoteToDelete(null);
  };

  const handleEditSave = (title: string, content: string, tags: string[]) => {
    if (currentNote) {
      onEdit(currentNote.id, title, content, tags);
      setIsEditDialogOpen(false);
      setCurrentNote(null);
    }
  };

  const handleDeleteSchemeClick = (noteId: string, schemeId: string) => {
    setSchemeToDelete({ noteId, schemeId });
    setShowDeleteSchemeDialog(true);
  };

  const handleDeleteSchemeConfirm = () => {
    if (schemeToDelete) {
      onDeleteScheme(schemeToDelete.noteId, schemeToDelete.schemeId);
      setShowDeleteSchemeDialog(false);
      setSchemeToDelete(null);
    }
  };

  const handleDeleteSchemeCancel = () => {
    setShowDeleteSchemeDialog(false);
    setSchemeToDelete(null);
  };

  const handleEditReadScheme = (scheme: ReadScheme) => {
    setSchemeToEdit(scheme);
    setShowEditSchemeDialog(true);
  };

  const handleEditSchemeSubmit = (text: string, title: string, isTitleEdited: boolean, tags: string[]) => {
    if (schemeToEdit && schemeToEdit.noteId) {
      onEditReadScheme(
        schemeToEdit.noteId,
        schemeToEdit.id,
        text,
        title,
        isTitleEdited,
        tags
      );
      setShowEditSchemeDialog(false);
      setSchemeToEdit(null);
    }
  };

  const handleMultiSelectToggle = () => {
    setIsMultiSelect(!isMultiSelect);
    setSelectedNotes(new Set());
  };

  const handleNoteSelect = (noteId: string) => {
    if (!isMultiSelect) return;
    
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === filteredItems.length) {
      // 如果当前是全选状态，则取消全选
      setSelectedNotes(new Set());
    } else {
      // 否则全选当前过滤后的所有笔记
      setSelectedNotes(new Set(filteredItems.map(note => note.id)));
    }
  };

  const handleBatchAddBreathing = async () => {
    if (selectedNotes.size === 0) return;
    
    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: selectedNotes.size });
    
    const selectedNotesArray = Array.from(selectedNotes);
    for (let i = 0; i < selectedNotesArray.length; i++) {
      const noteId = selectedNotesArray[i];
      const note = notes.find(n => n.id === noteId);
      if (note) {
        try {
          const processedText = await processText(note.content);
          onAddReadScheme(noteId, processedText, note.title);
        } catch (error) {
          console.error(`处理笔记 ${note.title} 时出错:`, error);
        }
      }
      setProcessingProgress(prev => ({ ...prev, current: i + 1 }));
    }
    
    setIsProcessing(false);
    setSelectedNotes(new Set());
    setIsMultiSelect(false);
  };

  return (
    <div className="flex h-full">
      {/* 左侧标签树 */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-4">
        <ManageTagTree
          allTags={allTags}
          onTagSelect={handleTagSelect}
          selectedTags={selectedTag ? [selectedTag] : []}
          style="indigo"
          items={notes}
        />
      </div>

      {/* 右侧内容 */}
      <div className="flex-1 flex flex-col">
        {/* 搜索栏 */}
        <ManageSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          hideSchemedNotes={hideSchemedNotes}
          onHideSchemedChange={setHideSchemedNotes}
          isMultiSelect={isMultiSelect}
          onMultiSelectToggle={handleMultiSelectToggle}
          selectedNotes={selectedNotes}
          onAddToList={handleBatchAddBreathing}
          onSelectAll={handleSelectAll}
          isAllSelected={selectedNotes.size === filteredItems.length && filteredItems.length > 0}
        />

        {/* 处理进度显示 */}
        {isProcessing && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-blue-700">
                正在处理笔记... ({processingProgress.current}/{processingProgress.total})
              </div>
              <div className="w-64 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(processingProgress.current / processingProgress.total) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 笔记列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredItems.map(note => (
            <div
              key={note.id}
              className={`p-4 border rounded-lg ${
                isMultiSelect && selectedNotes.has(note.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleNoteSelect(note.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(note.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!isMultiSelect && (
                    <>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleCreateClick(note);
                        }}
                        className="px-3 py-1 text-indigo-600 hover:text-indigo-800"
                      >
                        加入跟读
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleEditClick(note);
                        }}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800"
                      >
                        编辑
                      </button>
                      <TextDeleteButton
                        onClick={(e?: React.MouseEvent) => {
                          if (e) e.stopPropagation();
                          handleDeleteClick(note.id);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <TagDisplay tags={note.tags || []} />
              </div>
              <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                {note.content}
              </div>
              {/* 显示关联的跟读方案 */}
              {readSchemes
                .filter(scheme => scheme.noteId === note.id)
                .map(scheme => (
                  <div key={scheme.id} className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {scheme.title || note.title}
                        </h4>
                        <p className="mt-1 text-gray-700">{scheme.text}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleEditReadScheme(scheme);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          编辑
                        </button>
                        <TextDeleteButton
                          onClick={(e?: React.MouseEvent) => {
                            if (e) e.stopPropagation();
                            handleDeleteSchemeClick(note.id, scheme.id);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* 添加跟读对话框 */}
      {isAddReadDialogOpen && currentNote && (
        <AddReadDialog
          note={currentNote}
          onClose={() => {
            setIsAddReadDialogOpen(false);
            setCurrentNote(null);
          }}
          onAdd={onAddReadScheme}
        />
      )}

      {/* 编辑笔记对话框 */}
      {isEditDialogOpen && currentNote && (
        <EditNoteDialog
          note={currentNote}
          onClose={() => {
            setIsEditDialogOpen(false);
            setCurrentNote(null);
          }}
          onSave={handleEditSave}
        />
      )}

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              确认删除
            </h3>
            <p className="text-gray-700 mb-4">
              是否同时删除该笔记下的所有跟读方案？
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                取消
              </button>
              <TextDeleteButton
                onClick={() => handleManageDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                仅删除笔记
              </TextDeleteButton>
              <TextDeleteButton
                onClick={() => handleManageDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除笔记和跟读方案
              </TextDeleteButton>
            </div>
          </div>
        </div>
      )}

      {/* 删除跟读方案确认对话框 */}
      {showDeleteSchemeDialog && schemeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              确认删除
            </h3>
            <p className="text-gray-700 mb-4">
              确定要删除这个跟读方案吗？
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteSchemeCancel}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                取消
              </button>
              <TextDeleteButton
                onClick={handleDeleteSchemeConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除
              </TextDeleteButton>
            </div>
          </div>
        </div>
      )}

      {/* 编辑跟读方案对话框 */}
      {showEditSchemeDialog && schemeToEdit && (
        <EditReadDialog
          isOpen={showEditSchemeDialog}
          onClose={() => {
            setShowEditSchemeDialog(false);
            setSchemeToEdit(null);
          }}
          onSave={handleEditSchemeSubmit}
          initialText={schemeToEdit.text}
          initialTitle={schemeToEdit.title || ''}
          initialIsTitleEdited={schemeToEdit.isTitleEdited}
          initialTags={schemeToEdit.tags || []}
        />
      )}
    </div>
  );
} 