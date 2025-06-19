import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Note } from "../../types/index";
import { getTitle } from "../../utils/titleExtract";

interface EditNoteDialogProps {
  note: Note;
  onClose: () => void;
  onSave: (title: string, content: string, tags: string[]) => void;
}

export function EditNoteDialog({
  note,
  onClose,
  onSave,
}: EditNoteDialogProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isTitleEdited, setIsTitleEdited] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || '');
    setTags(note.tags || []);
    setIsTitleEdited(false);
  }, [note]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsTitleEdited(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // 如果标题未被编辑过，自动更新标题
    if (!isTitleEdited) {
      const { title: extractedTitle } = getTitle(newContent, title, note.title);
      setTitle(extractedTitle);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      // 分割标签：支持空格和逗号作为分隔符
      const tagList = newTag.split(/[,，\s]+/).filter(tag => tag.trim());
      
      // 添加新标签，过滤掉重复的
      const uniqueTags = tagList.filter(tag => !tags.includes(tag.trim()));
      if (uniqueTags.length > 0) {
        setTags([...tags, ...uniqueTags.map(tag => tag.trim())]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    // 如果标题未被编辑过，在保存时重新提取标题
    let finalTitle = title;
    if (!isTitleEdited) {
      const { title: extractedTitle } = getTitle(content, title, note.title);
      finalTitle = extractedTitle;
    }
    onSave(finalTitle, content, tags);
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            编辑笔记
          </Dialog.Title>

          <div className="space-y-4">
            {/* 标题输入框 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                标题
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="标题将自动提取，也可以手动编辑"
              />
            </div>

            {/* 内容输入框 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                内容
              </label>
              <textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                className="w-full h-64 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入笔记内容"
              />
            </div>

            {/* 标签管理 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标签
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入新标签，可用空格或逗号分隔多个标签"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
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