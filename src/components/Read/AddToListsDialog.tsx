interface ReadList {
  id: string;
  name: string;
  schemes: Array<{
    schemeId: string;
    noteId: string;
    order: number;
  }>;
}

interface AddToListsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  readLists: ReadList[];
  selectedSchemes: { schemeId: string; noteId: string; }[];
  onAddToList: (listId: string) => void;
  onCreateList: (name: string, schemes: { schemeId: string; noteId: string; }[]) => void;
  newListName: string;
  onNewListNameChange: (name: string) => void;
}

export function AddToListsDialog({
  isOpen,
  onClose,
  readLists,
  selectedSchemes,
  onAddToList,
  onCreateList,
  newListName,
  onNewListNameChange
}: AddToListsDialogProps) {
  if (!isOpen) return null;

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim(), selectedSchemes);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">选择跟读列表</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 创建新列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">创建新列表</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newListName}
                onChange={(e) => onNewListNameChange(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="输入列表名称"
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className={`px-4 py-2 rounded ${
                  newListName.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                创建
              </button>
            </div>
          </div>

          {/* 现有列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择现有列表</label>
            <div className="space-y-2">
              {readLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => onAddToList(list.id)}
                  className="w-full px-4 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {list.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
} 