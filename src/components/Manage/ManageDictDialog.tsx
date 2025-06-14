import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { DICT_CATEGORIES, type DictCategory, getDict, saveDict, resetDict } from '../../utils/Segment/manageDict';
import { exportDict, importDict, validateDictFile, type ProgressCallback } from '../../utils/Manage/dictImportExport';
import '../../styles/components/ManageDictDialog.css';
import '../../styles/components/common.css';

interface ManageDictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDictChange: (category: DictCategory, words: string[]) => void;
}

interface ProgressState {
  isActive: boolean;
  progress: number;
  message: string;
}

export function ManageDictDialog({
  isOpen,
  onClose,
  onDictChange
}: ManageDictDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<DictCategory>('proper');
  const [newWord, setNewWord] = useState('');
  const [categoryWords, setCategoryWords] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState>({
    isActive: false,
    progress: 0,
    message: ''
  });
  
  // 添加 refs 用于焦点管理
  const initialFocusRef = useRef<HTMLSelectElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newWordInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当分类改变时，更新当前分类的词库
  useEffect(() => {
    if (isOpen) {
      const updateWords = async () => {
        const words = await getDict(selectedCategory);
        setCategoryWords(words);
        // 当对话框打开时，将焦点设置到分类选择框
        setTimeout(() => {
          initialFocusRef.current?.focus();
        }, 0);
      };
      updateWords();
    }
  }, [isOpen, selectedCategory]);

  // 过滤显示的词库
  const filteredWords = categoryWords.filter(word => 
    word.includes(searchTerm)
  );

  const handleAddWord = async () => {
    const trimmedWord = newWord.trim();
    if (!trimmedWord) return;
    
    const updatedWords = [...categoryWords, trimmedWord];
    setCategoryWords(updatedWords);
    await saveDict(selectedCategory, updatedWords);
    onDictChange(selectedCategory, updatedWords);
    setNewWord('');
    // 添加词后，将焦点返回到输入框
    newWordInputRef.current?.focus();
  };

  const handleDeleteWord = async (word: string) => {
    const updatedWords = categoryWords.filter(w => w !== word);
    setCategoryWords(updatedWords);
    await saveDict(selectedCategory, updatedWords);
    onDictChange(selectedCategory, updatedWords);
  };

  const handleResetDict = async () => {
    await resetDict(selectedCategory);
    const words = await getDict(selectedCategory);
    setCategoryWords(words);
    onDictChange(selectedCategory, words);
    // 重置后，将焦点设置到分类选择框
    initialFocusRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  const handleProgress: ProgressCallback = (progress, message) => {
    setProgress({
      isActive: true,
      progress,
      message
    });
  };

  const handleExport = async () => {
    try {
      setProgress({ isActive: true, progress: 0, message: '准备导出...' });
      await exportDict(handleProgress);
      // 导出完成后延迟关闭进度显示
      setTimeout(() => {
        setProgress(prev => ({ ...prev, isActive: false }));
      }, 1000);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出词库失败，请重试');
      setProgress({ isActive: false, progress: 0, message: '' });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setProgress({ isActive: true, progress: 0, message: '准备导入...' });

    try {
      // 验证文件
      const isValid = await validateDictFile(file, handleProgress);
      if (!isValid) {
        throw new Error('无效的词库文件格式');
      }

      // 导入词库
      await importDict(file, handleProgress);
      
      // 更新当前显示
      const words = await getDict(selectedCategory);
      setCategoryWords(words);
      onDictChange(selectedCategory, words);
      
      // 导入完成后延迟关闭进度显示
      setTimeout(() => {
        setProgress(prev => ({ ...prev, isActive: false }));
      }, 1000);
    } catch (error) {
      console.error('导入失败:', error);
      setImportError(error instanceof Error ? error.message : '导入词库失败');
      setProgress({ isActive: false, progress: 0, message: '' });
    } finally {
      // 清除文件输入，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="fixed inset-0 z-50 overflow-y-auto"
      initialFocus={initialFocusRef}
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <Dialog.Title className="text-lg font-medium mb-4">词库管理</Dialog.Title>

          {/* 导入/导出按钮 */}
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={handleImport}
              disabled={progress.isActive}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              导入词库
            </button>
            <button
              onClick={handleExport}
              disabled={progress.isActive}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              导出词库
            </button>
          </div>

          {/* 进度显示 */}
          {progress.isActive && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{progress.message}</span>
                <span className="text-sm text-gray-600">{progress.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  data-progress={progress.progress}
                />
              </div>
            </div>
          )}

          {/* 导入错误提示 */}
          {importError && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
              {importError}
            </div>
          )}

          {/* 分类选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              选择词库分类
            </label>
            <select
              ref={initialFocusRef}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DictCategory)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="选择词库分类"
              disabled={progress.isActive}
            >
              {DICT_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {/* 显示分类描述 */}
            {DICT_CATEGORIES.find(c => c.id === selectedCategory)?.description && (
              <p className="mt-1 text-sm text-gray-500">
                {DICT_CATEGORIES.find(c => c.id === selectedCategory)?.description}
              </p>
            )}
          </div>

          {/* 搜索框 */}
          <div className="mb-4">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索词库..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="搜索词库"
              disabled={progress.isActive}
            />
          </div>

          {/* 添加新词 */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  ref={newWordInputRef}
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    selectedCategory === 'no_split_before' 
                      ? '输入词前不拆的词，如"的"、"了"等...' 
                      : selectedCategory === 'no_split_after'
                        ? '输入词后不拆的词，如"的"、"了"等...'
                        : '输入新词...'
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="输入新词"
                  disabled={progress.isActive}
                />
              </div>
              <button
                onClick={handleAddWord}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={progress.isActive}
              >
                添加
              </button>
              <button
                onClick={handleResetDict}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                title="重置当前分类的词库到默认值"
                disabled={progress.isActive}
              >
                重置
              </button>
            </div>
          </div>

          {/* 词库列表 */}
          <div className="mb-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredWords.map(word => (
                <div
                  key={word}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => handleDeleteWord(word)}
                    className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded disabled:opacity-50"
                    title="删除此词"
                    aria-label={`删除词：${word}`}
                    disabled={progress.isActive}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-2 text-sm text-gray-500">
            <p>提示：</p>
            <ul className="list-disc list-inside">
              <li>词库用于辅助文本分词，添加常用词可以提高分词准确性</li>
              <li>每个分类的词库独立管理，可以根据需要添加或删除</li>
              <li>添加的词会立即生效，影响后续的分词结果</li>
              <li>点击"重置"可以恢复当前分类的默认词库</li>
              <li>可以使用"导入/导出"功能备份或恢复词库设置</li>
              {selectedCategory === 'number' && (
                <li>数字词会在分词时根据上下文（如数字、"几"、"多少"等）进行识别</li>
              )}
              {selectedCategory === 'no_split_before' && (
                <li>添加的词前面不会添加换气点，适合用于"的"、"了"等词</li>
              )}
              {selectedCategory === 'no_split_after' && (
                <li>添加的词后面不会添加换气点，适合用于"的"、"了"等词</li>
              )}
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={progress.isActive}
            >
              关闭
            </button>
          </div>

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="导入词库文件"
          />

          {/* 处理中提示 */}
          {progress.isActive && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="text-lg font-medium mb-4">处理中...</div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    data-progress={progress.progress}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {progress.message}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
} 