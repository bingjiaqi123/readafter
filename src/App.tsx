import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { ReadPage } from './components/Read/ReadPage';
import { ManagePage } from './components/Manage/ManagePage';
import { AddNotePage } from './components/AddNote/AddNotePage';
import { ReadListsPage } from './components/Lists/ReadListsPage';
import { Note, ReadList, ReadScheme } from './types';
import { exportData, importData } from './data/importExport';
import { 
  deleteNote, 
  deleteScheme, 
  deleteNoteAndSchemes,
  deleteNotes,
  deleteNotesAndSchemes,
  deleteSchemes
} from './utils/Manage/manageDelete';
import { createSchemesFromNotes } from './utils/Manage/manageAddScheme';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [readLists, setReadLists] = useState<ReadList[]>([]);
  const [readSchemes, setReadSchemes] = useState<ReadScheme[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [hideSchemedNotes, setHideSchemedNotes] = useState(false);

  const handleAddScheme = async (noteIds: string[]) => {
    // 为每个选中的笔记创建跟读方案（包含气口处理）
    const newSchemes = await createSchemesFromNotes(noteIds, notes);
    setReadSchemes(prev => [...prev, ...newSchemes]);
  };

  const handleAddNote = (note: Note) => {
    setNotes(prev => [...prev, note]);
  };

  const handleEditReadScheme = (_listId: string, schemeId: string, text: string, title: string, isTitleEdited: boolean) => {
    // Update the scheme in readSchemes
    setReadSchemes(prevSchemes =>
      prevSchemes.map(scheme =>
        scheme.id === schemeId
          ? { ...scheme, text, title, isTitleEdited, timestamp: new Date().toISOString() }
          : scheme
      )
    );
  };

  const handleCreateList = (name: string, schemes: { schemeId: string; noteId: string }[]) => {
    const newList: ReadList = {
      id: new Date().toISOString(),
      name,
      schemes: schemes.map((scheme, index) => ({
        schemeId: scheme.schemeId,
        noteId: scheme.noteId,
        order: index
      })),
      isPinned: false
    };
    setReadLists(prev => [...prev, newList]);
  };

  const handleAddToExistingList = (listId: string, schemes: { schemeId: string; noteId: string }[]) => {
    setReadLists(prev => prev.map(list => {
      if (list.id === listId) {
        // 获取当前列表中的最大 order 值
        const maxOrder = Math.max(...list.schemes.map(s => s.order), -1);
        
        // 创建一个 Map 来存储现有的方案，key 为 schemeId
        const existingSchemesMap = new Map(
          list.schemes.map(scheme => [scheme.schemeId, scheme])
        );
        
        // 更新或添加新方案
        schemes.forEach((scheme, index) => {
          existingSchemesMap.set(scheme.schemeId, {
            schemeId: scheme.schemeId,
            noteId: scheme.noteId,
            // 如果是新方案，使用新的 order；如果是更新现有方案，保持原有 order
            order: existingSchemesMap.has(scheme.schemeId) 
              ? existingSchemesMap.get(scheme.schemeId)!.order 
              : maxOrder + 1 + index
          });
        });
        
        return {
          ...list,
          schemes: Array.from(existingSchemesMap.values())
        };
      }
      return list;
    }));
  };

  const handleUpdateListName = (listId: string, newName: string) => {
    setReadLists(prevLists => 
      prevLists.map(list => 
        list.id === listId 
          ? { ...list, name: newName }
          : list
      )
    );
  };

  const handleUpdateSchemeOrder = (listId: string, schemeIds: string[]) => {
    setReadLists(prevLists => 
      prevLists.map(list => {
        if (list.id !== listId) return list;

        // Create a map of new orders based on the schemeIds array
        const newOrders = new Map(schemeIds.map((schemeId, index) => [schemeId, index]));

        // Update the schemes with new orders
        const updatedSchemes = list.schemes
          .filter(scheme => newOrders.has(scheme.schemeId))
          .map(scheme => ({
            ...scheme,
            order: newOrders.get(scheme.schemeId)!
          }));

        return { ...list, schemes: updatedSchemes };
      })
    );
  };

  const handleExport = async () => {
    try {
      // 直接使用 localStorage 中的数据，因为它已经包含了完整的快捷短语信息
      await exportData({ 
        notes, 
        readLists, 
        readSchemes,
        quickPhrases: [] // 这个值会被 exportData 函数中的 localStorage 数据覆盖
      });
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  const handleImport = async () => {
    try {
      const importedData = await importData();
      if (importedData) {
        setNotes(importedData.notes);
        setReadLists(importedData.readLists);
        setReadSchemes(importedData.readSchemes);
        
        // 更新快捷短语，保持完整的数据结构
        localStorage.setItem('quickPhrases', JSON.stringify(importedData.quickPhrases));
        // 触发快捷短语更新事件
        window.dispatchEvent(new Event('quickPhrasesUpdated'));
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请重试');
    }
  };

  const handleDeleteReadList = (listId: string, deleteMode: 'list-only' | 'unique-schemes' | 'all-schemes') => {
    if (deleteMode === 'list-only') {
      // 只删除列表，保留方案
      setReadLists(prev => prev.filter(list => list.id !== listId));
    } else if (deleteMode === 'unique-schemes') {
      // 删除列表和仅在该列表中的方案
      const list = readLists.find(l => l.id === listId);
      if (!list) return;

      // 获取仅在该列表中的方案ID
      const uniqueSchemeIds = new Set(list.schemes.map(s => s.schemeId));
      readLists.forEach(otherList => {
        if (otherList.id !== listId) {
          otherList.schemes.forEach(s => uniqueSchemeIds.delete(s.schemeId));
        }
      });

      // 删除列表和唯一方案
      setReadLists(prev => prev.filter(l => l.id !== listId));
      setReadSchemes(prev => prev.filter(s => !uniqueSchemeIds.has(s.id)));
    } else if (deleteMode === 'all-schemes') {
      // 删除列表和所有相关方案
      const list = readLists.find(l => l.id === listId);
      if (!list) return;

      // 获取所有相关方案ID
      const schemeIds = new Set(list.schemes.map(s => s.schemeId));

      // 删除列表和所有相关方案
      setReadLists(prev => prev.filter(l => l.id !== listId));
      setReadSchemes(prev => prev.filter(s => !schemeIds.has(s.id)));
    }
  };

  const handleDeleteScheme = (_noteId: string, schemeId: string) => {
    // 从跟读方案列表中删除
    setReadSchemes(prev => deleteScheme(prev, schemeId));
    // 从所有列表中删除该方案
    setReadLists(prevLists => 
      prevLists.map(list => ({
        ...list,
        schemes: list.schemes.filter(s => s.schemeId !== schemeId)
      }))
    );
  };

  const handleEditNote = (noteId: string, title: string, content: string, tags: string[]) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, title, content, tags, timestamp: new Date().toISOString() }
        : note
    ));
  };

  const handleDeleteNote = (noteId: string, deleteMode: 'note-only' | 'note-and-schemes') => {
    if (deleteMode === 'note-only') {
      // 只删除笔记
      setNotes(prev => deleteNote(prev, noteId));
    } else {
      // 删除笔记并同时删除相关的跟读方案
      const result = deleteNoteAndSchemes(notes, readSchemes, noteId);
      setNotes(result.notes);
      setReadSchemes(result.schemes);
      
      // 从所有列表中删除相关方案
      setReadLists(prevLists => 
        prevLists.map(list => ({
          ...list,
          schemes: list.schemes.filter(s => s.noteId !== noteId)
        }))
      );
    }
  };

  const handleBatchDeleteNotes = (noteIds: string[], deleteMode: 'note-only' | 'note-and-schemes') => {
    if (deleteMode === 'note-only') {
      // 批量删除笔记
      setNotes(prev => deleteNotes(prev, noteIds));
    } else {
      // 批量删除笔记并同时删除相关的跟读方案
      const result = deleteNotesAndSchemes(notes, readSchemes, noteIds);
      setNotes(result.notes);
      setReadSchemes(result.schemes);
      
      // 从所有列表中删除相关方案
      setReadLists(prevLists => 
        prevLists.map(list => ({
          ...list,
          schemes: list.schemes.filter(s => !noteIds.includes(s.noteId))
        }))
      );
    }
  };

  const handleBatchDeleteSchemes = (schemeIds: string[]) => {
    // 批量删除跟读方案
    setReadSchemes(prev => deleteSchemes(prev, schemeIds));
    // 从所有列表中删除这些方案
    setReadLists(prevLists => 
      prevLists.map(list => ({
        ...list,
        schemes: list.schemes.filter(s => !schemeIds.includes(s.schemeId))
      }))
    );
  };

  const handleAddReadScheme = (noteId: string, text: string, title?: string) => {
    const newScheme: ReadScheme = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      noteId: noteId,
      text: text,
      title: title || '',
      timestamp: new Date().toISOString(),
      tags: [],
      isTitleEdited: false
    };
    setReadSchemes(prev => [...prev, newScheme]);
  };

  const handleUpdateNoteTags = (noteIds: string[], newTags: string[]) => {
    setNotes(prev => prev.map(note => 
      noteIds.includes(note.id) 
        ? { ...note, tags: newTags, timestamp: new Date().toISOString() }
        : note
    ));
  };

  const handleUpdateSchemeTags = (schemeIds: string[], newTags: string[]) => {
    setReadSchemes(prev => prev.map(scheme => 
      schemeIds.includes(scheme.id) 
        ? { ...scheme, tags: newTags, timestamp: new Date().toISOString() }
        : scheme
    ));
  };

  const handleToggleListPin = (listId: string) => {
    setReadLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, isPinned: !list.isPinned }
        : list
    ));
  };

  return (
    <div className="container mx-auto">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 mb-4">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Tab.List className="flex space-x-4">
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">添加</Tab>
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">管理</Tab>
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">方案</Tab>
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">列表</Tab>
            </Tab.List>
            <div className="flex space-x-2">
              <button
                onClick={handleImport}
                className="px-4 py-2 text-lg font-medium text-blue-900 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              >
                导入
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-lg font-medium text-blue-900 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              >
                导出
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="px-4">
          <Tab.Panels>
            <Tab.Panel>
              <AddNotePage 
                onAdd={handleAddNote} 
                onCancel={() => setActiveTab(0)} 
              />
            </Tab.Panel>
            <Tab.Panel>
              <ManagePage
                notes={notes}
                readSchemes={readSchemes}
                onSearchChange={(term) => {
                  // 如果需要，可以在这里添加额外的搜索逻辑
                  console.log('Search term:', term);
                }}
                hideSchemedNotes={hideSchemedNotes}
                onHideSchemedNotesChange={setHideSchemedNotes}
                onAddScheme={handleAddScheme}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
                onBatchDeleteNotes={handleBatchDeleteNotes}
                onAddReadScheme={handleAddReadScheme}
                onUpdateNoteTags={handleUpdateNoteTags}
              />
            </Tab.Panel>
            <Tab.Panel>
              <ReadPage
                notes={notes}
                readLists={readLists}
                readSchemes={readSchemes}
                onDeleteScheme={handleDeleteScheme}
                onBatchDeleteSchemes={handleBatchDeleteSchemes}
                onCreateList={handleCreateList}
                onAddToExistingList={handleAddToExistingList}
                onEditReadScheme={handleEditReadScheme}
                onUpdateSchemeTags={handleUpdateSchemeTags}
              />
            </Tab.Panel>
            <Tab.Panel>
              <ReadListsPage
                readLists={readLists}
                readSchemes={readSchemes}
                onDeleteReadList={handleDeleteReadList}
                onUpdateListName={handleUpdateListName}
                onUpdateSchemeOrder={handleUpdateSchemeOrder}
                onAddToExistingList={handleAddToExistingList}
                onDeleteScheme={handleDeleteScheme}
                onEditReadScheme={handleEditReadScheme}
                onToggleListPin={handleToggleListPin}
              />
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
} 