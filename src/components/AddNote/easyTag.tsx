import React, { useState, useEffect } from 'react';
import { TinyDeleteButton } from '../TinyDeleteButton';

interface EasyTagProps {
  onTagSelect: (tag: string) => void;
}

interface TagItem {
  text: string;
  isPinned: boolean;
}

const QUICK_PHRASES_KEY = 'quickPhrases';

export function EasyTag({ onTagSelect }: EasyTagProps) {
  const [quickPhrases, setQuickPhrases] = useState<TagItem[]>(() => {
    const saved = localStorage.getItem(QUICK_PHRASES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newTag, setNewTag] = useState('');

  // 当快捷短语变化时保存到本地存储
  useEffect(() => {
    localStorage.setItem(QUICK_PHRASES_KEY, JSON.stringify(quickPhrases));
  }, [quickPhrases]);

  const handleAddQuickPhrase = () => {
    if (newTag.trim() && !quickPhrases.some(tag => tag.text === newTag.trim())) {
      setQuickPhrases([...quickPhrases, { text: newTag.trim(), isPinned: false }]);
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddQuickPhrase();
    }
  };

  const handleTogglePin = (tagText: string) => {
    setQuickPhrases(quickPhrases.map(tag => 
      tag.text === tagText ? { ...tag, isPinned: !tag.isPinned } : tag
    ));
  };

  const handleDeleteTag = (tagText: string) => {
    setQuickPhrases(quickPhrases.filter(tag => tag.text !== tagText));
  };

  // 对标签进行排序：置顶的在前，未置顶的在后
  const sortedTags = [...quickPhrases].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <div className="w-64 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">快捷短语</h3>
      
      {/* 添加快捷短语的输入框 */}
      <div className="flex mb-3">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入短语"
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleAddQuickPhrase}
          className="px-2 py-1 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          title="添加快捷短语"
        >
          +
        </button>
      </div>

      {/* 快捷短语列表 */}
      <div className="space-y-2">
        {sortedTags.map((tag) => (
          <div key={tag.text} className="flex items-center gap-1">
            <button
              onClick={() => onTagSelect(tag.text)}
              className="flex-1 px-2 py-1 text-sm text-left bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {tag.text}
            </button>
            <button
              onClick={() => handleTogglePin(tag.text)}
              className={`p-1 rounded hover:bg-gray-100 ${tag.isPinned ? 'text-yellow-500' : 'text-gray-400'}`}
              title={tag.isPinned ? "取消置顶" : "置顶"}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
              </svg>
            </button>
            <TinyDeleteButton onClick={() => handleDeleteTag(tag.text)} />
          </div>
        ))}
      </div>
    </div>
  );
} 