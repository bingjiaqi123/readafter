import React, { useState, useEffect } from 'react';
import { TagInputProps, processTagString } from '../../utils/AddNote/tagInput';

export function QuickTagInput({ tags, onChange, onModeChange }: Omit<TagInputProps, 'mode'>) {
    const [inputValue, setInputValue] = useState('');

  // 当外部标签变化时，更新输入框的值
  useEffect(() => {
    setInputValue(tags.join(', '));
  }, [tags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const processedTags = processTagString(newValue);
    onChange(processedTags);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        标签（用逗号分隔）
      </label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入标签，用逗号分隔"
        />
        <button
          type="button"
          onClick={() => onModeChange('normal')}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          切换到普通模式
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
} 