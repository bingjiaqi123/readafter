import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

interface EditTagsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tags: string[]) => void;
  onSaveWithDiff: (tagsToAdd: string[], tagsToRemove: string[]) => void;
  initialTags: string[];
  allTags: string[]; // 所有选中的笔记/方案用到的标签
  itemCount: number; // 选中的笔记/方案数量
  itemType: 'note' | 'scheme'; // 是笔记还是方案
}

export function EditTagsDialog({
  isOpen,
  onClose,
  onSave,
  onSaveWithDiff,
  initialTags,
  allTags,
  itemCount,
  itemType
}: EditTagsDialogProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [isTagsConsistent, setIsTagsConsistent] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // 检查标签是否完全一致（与顺序无关）
      const isConsistent = initialTags.length === allTags.length && 
        initialTags.every(tag => allTags.includes(tag)) &&
        allTags.every(tag => initialTags.includes(tag));
      
      setIsTagsConsistent(isConsistent);
      
      if (isConsistent) {
        // 标签一致时，使用initialTags
        setTags(initialTags);
      } else {
        // 标签不一致时，使用allTags作为初始值，这样删除按钮就能工作
        setTags(allTags);
      }
      setNewTag('');
    }
  }, [isOpen, initialTags, allTags]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (isTagsConsistent) {
      // 标签一致时，直接保存新标签
      onSave(tags);
    } else {
      // 标签不一致时，计算差异并保存
      const tagsToRemove = allTags.filter(tag => !tags.includes(tag));
      const tagsToAdd = tags.filter(tag => !allTags.includes(tag));
      onSaveWithDiff(tagsToAdd, tagsToRemove);
    }
    onClose();
  };

  const getItemTypeText = () => {
    return itemType === 'note' ? '笔记' : '方案';
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            标签变更
          </Dialog.Title>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              已选择 {itemCount} 个{getItemTypeText()}
            </p>
            
            {isTagsConsistent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 text-sm">
                  ✓ 所有选中的{getItemTypeText()}标签完全一致，可以直接编辑
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  ⚠ 选中的{getItemTypeText()}标签不一致，移除标签将作用于所有使用该标签的{getItemTypeText()}，添加标签将作用于所有选中的{getItemTypeText()}
                </p>
              </div>
            )}

            {/* 当前标签显示 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isTagsConsistent ? '当前标签' : '所有相关标签'}
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 编辑后的标签（标签一致时）或保留的标签（标签不一致时） */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isTagsConsistent ? '编辑后的标签' : '保留的标签'}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {!isTagsConsistent && (
                <p className="text-xs text-gray-500">
                  移除标签将作用于所有使用该标签的{getItemTypeText()}，添加标签将作用于所有选中的{getItemTypeText()}
                </p>
              )}
            </div>
              
            {/* 添加新标签 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                添加新标签
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入新标签"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
            </div>

            {/* 操作说明 */}
            {!isTagsConsistent && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-gray-800 mb-2">操作说明：</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 移除标签：将移除所有使用该标签的{getItemTypeText()}中的该标签</li>
                  <li>• 添加标签：将为所有选中的{getItemTypeText()}添加该标签</li>
                  <li>• 最终结果：所有选中的{getItemTypeText()}将具有相同的标签集合</li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 