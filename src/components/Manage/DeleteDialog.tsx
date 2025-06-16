import { Dialog } from '@headlessui/react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteMode: 'note-only' | 'note-and-schemes') => void;
  itemCount: number;
  itemType: 'note' | 'scheme';
  isBatchDelete?: boolean;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemType,
  isBatchDelete = false
}: DeleteDialogProps) {
  const getItemTypeText = () => {
    return itemType === 'note' ? '笔记' : '方案';
  };

  const getTitle = () => {
    if (isBatchDelete) {
      return `删除${getItemTypeText()}`;
    }
    return `删除${getItemTypeText()}`;
  };

  const getMessage = () => {
    if (isBatchDelete) {
      return `确定要删除选中的 ${itemCount} 个${getItemTypeText()}吗？`;
    }
    return `确定要删除这个${getItemTypeText()}吗？`;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            {getTitle()}
          </Dialog.Title>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              {getMessage()}
            </p>
            <p className="text-sm text-gray-500">
              此操作无法撤销。
            </p>
          </div>

          {itemType === 'note' && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => onConfirm('note-only')}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-left"
              >
                仅删除{getItemTypeText()}
              </button>
              <button
                onClick={() => onConfirm('note-and-schemes')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-left"
              >
                一并删除相关跟读方案
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          )}

          {itemType === 'scheme' && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={() => onConfirm('note-only')} // 对于方案，使用note-only模式
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
} 