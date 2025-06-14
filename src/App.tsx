import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { ReadPage } from './components/Read/ReadPage';
import { ManagePage } from './components/Manage/ManagePage';
import { AddNotePage } from './components/AddNote/AddNotePage';
import { ReadListsPage } from './components/Lists/ReadListsPage';
import { Note, ReadList, ReadScheme } from './types';
import { deleteReadList } from './utils/Lists/listsDelete';
import { exportData, importData } from './Data/importExport';

interface ReadPageProps {
  notes: Note[];
  readLists: ReadList[];
  readSchemes: ReadScheme[];
  onDeleteScheme: (noteId: string, schemeId: string) => void;
  onCreateList: (name: string, schemes: { schemeId: string; noteId: string }[]) => void;
  onAddToExistingList: (listId: string, schemes: { schemeId: string; noteId: string }[]) => void;
  onEditReadScheme: (noteId: string, schemeId: string, text: string, title: string, isTitleEdited: boolean) => void;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [readLists, setReadLists] = useState<ReadList[]>([]);
  const [readSchemes, setReadSchemes] = useState<ReadScheme[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const handleAddNote = (note: Note) => {
    setNotes(prev => [...prev, note]);
  };

  const handleEditNote = (id: string, title: string, content: string, tags: string[]) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, title, content, tags }
          : note
      )
    );
  };

  const handleDeleteNote = (id: string, deleteReadSchemes: boolean) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (deleteReadSchemes) {
      setReadSchemes(prev => prev.filter(scheme => scheme.noteId !== id));
      setReadLists(prevLists =>
        prevLists.map(list => ({
          ...list,
          schemes: list.schemes.filter(s => s.noteId !== id)
        }))
      );
    }
  };

  const handleDeleteScheme = (noteId: string, schemeId: string) => {
    // 从跟读方案列表中删除
    setReadSchemes(prev => prev.filter(scheme => scheme.id !== schemeId && scheme.noteId !== noteId));
    
    // 从所有列表中删除该方案
    setReadLists(prevLists => 
      prevLists.map(list => ({
        ...list,
        schemes: list.schemes.filter(s => s.schemeId !== schemeId && s.noteId !== noteId)
      }))
    );
  };

  const handleEditReadScheme = (
    noteId: string,
    schemeId: string,
    text: string,
    title: string,
    isTitleEdited: boolean,
    tags: string[]
  ) => {
    setReadSchemes(prevSchemes =>
      prevSchemes.map(scheme =>
        scheme.id === schemeId
          ? { ...scheme, text, title, isTitleEdited, tags }
          : scheme
      )
    );
  };

  const handleAddReadScheme = (noteId: string, text: string, title?: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newScheme: ReadScheme = {
      id: Date.now().toString(),
      noteId,
      text,
      title: title || note.title,
      tags: [...(note.tags || [])],
      isTitleEdited: false,
      timestamp: new Date().toISOString()
    };
    setReadSchemes(prev => [...prev, newScheme]);
  };

  const handleCreateList = (name: string, schemes: { schemeId: string; noteId: string }[]) => {
    const newList: ReadList = {
      id: Date.now().toString(),
      name,
      schemes: schemes.map((scheme, index) => ({
        schemeId: scheme.schemeId,
        noteId: scheme.noteId,
        order: index
      }))
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

  const handleDeleteList = (listId: string) => {
    setReadLists(prev => prev.filter(list => list.id !== listId));
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

  const handleUpdateSchemeOrder = (listId: string, schemeId: string, newOrder: number) => {
    setReadLists(prevLists => 
      prevLists.map(list => {
        if (list.id !== listId) return list;

        // 如果 newOrder 是 -1，表示要删除这个方案
        if (newOrder === -1) {
          return {
            ...list,
            schemes: list.schemes.filter(s => s.schemeId !== schemeId)
          };
        }

        // 获取当前方案
        const currentScheme = list.schemes.find(s => s.schemeId === schemeId);
        if (!currentScheme) return list;

        // 更新其他方案的顺序
        const updatedSchemes = list.schemes.map(scheme => {
          if (scheme.schemeId === schemeId) {
            return { ...scheme, order: newOrder };
          }
          // 如果新顺序小于当前顺序，将当前顺序加1
          if (newOrder < scheme.order && scheme.order <= currentScheme.order) {
            return { ...scheme, order: scheme.order + 1 };
          }
          // 如果新顺序大于当前顺序，将当前顺序减1
          if (newOrder > scheme.order && scheme.order >= currentScheme.order) {
            return { ...scheme, order: scheme.order - 1 };
          }
          return scheme;
        });

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

  return (
    <div className="container mx-auto">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 mb-4">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Tab.List className="flex space-x-4">
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">添加笔记</Tab>
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">管理笔记</Tab>
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">跟读方案</Tab>
              <Tab className="tab-button text-lg px-6 py-2.5 font-medium rounded-lg transition-all duration-200 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:text-blue-900 ui-not-selected:hover:bg-blue-500/10">跟读列表</Tab>
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
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onDeleteScheme={handleDeleteScheme}
                onEditReadScheme={handleEditReadScheme}
                onAddReadScheme={handleAddReadScheme}
              />
            </Tab.Panel>
            <Tab.Panel>
              <ReadPage
                notes={notes}
                readLists={readLists}
                readSchemes={readSchemes}
                onDeleteScheme={handleDeleteScheme}
                onCreateList={handleCreateList}
                onAddToExistingList={handleAddToExistingList}
                onEditReadScheme={handleEditReadScheme}
              />
            </Tab.Panel>
            <Tab.Panel>
              <ReadListsPage
                items={notes}
                readLists={readLists}
                readSchemes={readSchemes}
                onDeleteReadList={(listId: string, deleteMode: 'list-only' | 'unique-schemes' | 'all-schemes') => {
                  const { readLists: newReadLists, readSchemes: newReadSchemes } = deleteReadList(
                    readLists,
                    notes,
                    readSchemes,
                    listId,
                    deleteMode
                  );
                  setReadLists(newReadLists);
                  setReadSchemes(newReadSchemes);
                }}
                onCreateReadList={handleCreateList}
                onUpdateListName={handleUpdateListName}
                onUpdateSchemeOrder={handleUpdateSchemeOrder}
              />
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
} 