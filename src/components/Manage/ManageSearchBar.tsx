// import React from 'react';

interface ManageSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  hideSchemedNotes?: boolean;
  onHideSchemedChange?: (hide: boolean) => void;
  isMultiSelect?: boolean;
  isAllSelect?: boolean;
  onMultiSelectToggle?: () => void;
  onAllSelectToggle?: () => void;
  onCancelMultiSelect?: () => void;
  selectedNotes: Set<string>;
  onAddToList?: () => void;
  onDeleteAll?: () => void;
  onTagChange?: () => void;
}

export function ManageSearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "搜索标题、内容或标签...",
  hideSchemedNotes = false,
  onHideSchemedChange,
  isMultiSelect = false,
  isAllSelect = false,
  onMultiSelectToggle,
  onAllSelectToggle,
  onCancelMultiSelect,
  selectedNotes,
  onAddToList,
  onDeleteAll,
  onTagChange
}: ManageSearchBarProps) {
  return (
    <div className="border-b border-gray-200">
      {/* 第一行：搜索栏和操作按钮 */}
      <div className="p-4">
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

          {/* 正常模式 */}
          {!isMultiSelect && !isAllSelect && (
            <>
              {onMultiSelectToggle && (
                <button
                  onClick={onMultiSelectToggle}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  多选
                </button>
              )}
              {onAllSelectToggle && (
                <button
                  onClick={onAllSelectToggle}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  全选
                </button>
              )}
            </>
          )}

          {/* 多选模式 */}
          {isMultiSelect && !isAllSelect && (
            <>
              <button
                onClick={onCancelMultiSelect}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                取消
              </button>
              <span className="text-gray-600">
                已选择 {selectedNotes.size} 个笔记
              </span>
            </>
          )}

          {/* 全选模式 */}
          {isAllSelect && (
            <>
              <button
                onClick={onCancelMultiSelect}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                取消
              </button>
              <span className="text-gray-600">
                已选择 {selectedNotes.size} 个笔记
              </span>
            </>
          )}
        </div>
      </div>

      {/* 第二行：操作按钮 */}
      {(isMultiSelect || isAllSelect) && (
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-4">
            {onTagChange && (
              <button
                onClick={onTagChange}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                标签变更
              </button>
            )}
            {onDeleteAll && (
              <button
                onClick={onDeleteAll}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                全部删除
              </button>
            )}
            {onAddToList && selectedNotes.size > 0 && (
              <button
                onClick={onAddToList}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                一键添加气口 ({selectedNotes.size})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 