import React from 'react';

interface ManageSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  hideSchemedNotes?: boolean;
  onHideSchemedChange?: (hide: boolean) => void;
  isMultiSelect?: boolean;
  onMultiSelectToggle?: () => void;
  selectedNotes: Set<string>;
  onAddToList?: () => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
}

export function ManageSearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "搜索标题、内容或标签...",
  hideSchemedNotes = false,
  onHideSchemedChange,
  isMultiSelect = false,
  onMultiSelectToggle,
  selectedNotes,
  onAddToList,
  onSelectAll,
  isAllSelected = false
}: ManageSearchBarProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {onHideSchemedChange && (
          <button
            onClick={() => onHideSchemedChange(!hideSchemedNotes)}
            className={`p-2 rounded-lg ${
              hideSchemedNotes
                ? 'bg-gray-200 text-gray-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
            title={hideSchemedNotes ? "显示所有笔记" : "隐藏已添加跟读方案的笔记"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {onMultiSelectToggle && (
          <button
            onClick={onMultiSelectToggle}
            className={`px-4 py-2 rounded ${
              isMultiSelect
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isMultiSelect ? '取消多选' : '多选'}
          </button>
        )}

        {isMultiSelect && (
          <span className="text-gray-600">
            已选择 {selectedNotes.size} 个笔记
          </span>
        )}

        {isMultiSelect && onSelectAll && (
          <button
            onClick={onSelectAll}
            className={`px-4 py-2 rounded ${
              isAllSelected
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isAllSelected ? '取消全选' : '全选'}
          </button>
        )}

        {isMultiSelect && selectedNotes.size > 0 && onAddToList && (
          <button
            onClick={onAddToList}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            一键添加气口 ({selectedNotes.size})
          </button>
        )}
      </div>
    </div>
  );
} 