import React, { useState, FormEvent } from "react";
import { cleanText } from "../../utils/textCleaner";
import { getTitle } from "../../utils/titleExtract";
import { formatText } from "../../utils/AddNote/textFormatter";
import { QuickTagInput } from "./quickTagInput";
import { NormalTagInput } from "./normalTagInput";
import { useTagInputMode } from "../../utils/AddNote/tagInputMode";
import { resetNoteForm } from "../../utils/AddNote/formReset";
import { Note } from '../../types';
import { FormatMode } from "./FormatMode";
import { EasyTag } from "./easyTag";

interface AddNotePageProps {
  onAdd: (note: Note) => void;
  onCancel: () => void;
}

export function AddNotePage({ onAdd, onCancel }: AddNotePageProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isTitleEdited, setIsTitleEdited] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [autoFormat, setAutoFormat] = useState(false);
  const { mode, setMode } = useTagInputMode();

  // 当内容变化时，如果标题未被编辑过，自动更新标题
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (!isTitleEdited) {
      const { title: extractedTitle } = getTitle(newContent, title, "");
      setTitle(extractedTitle);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsTitleEdited(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');
    
    if (!content.trim()) {
      console.log('Content is empty, not submitting');
      return;
    }

    // 如果开启了自动调整格式，先进行格式调整
    const formattedContent = autoFormat ? formatText(content) : content;
    
    // 清理文本内容
    const cleanedContent = cleanText(formattedContent);
    console.log('Content cleaned:', cleanedContent);
    
    // 如果标题未被编辑过，重新提取标题
    let finalTitle = title;
    if (!isTitleEdited) {
      const { title: extractedTitle } = getTitle(cleanedContent, title, "");
      finalTitle = extractedTitle;
    }
    console.log('Title:', finalTitle);
    
    // 如果标签为空，获取所有置顶的快捷短语
    let finalTags = tags;
    if (tags.length === 0) {
      const savedTags = localStorage.getItem('quickPhrases');
      if (savedTags) {
        const quickPhrases = JSON.parse(savedTags);
        finalTags = quickPhrases
          .filter((tag: { text: string; isPinned: boolean }) => tag.isPinned)
          .map((tag: { text: string }) => tag.text);
      }
    }
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: finalTitle,
      content: cleanedContent,
      tags: finalTags,
      timestamp: new Date().toISOString(),
    };

    console.log('Creating new note:', newNote);
    try {
      onAdd(newNote);
      console.log('Note added successfully');
      // 重置表单状态
      resetNoteForm(setContent, setTags, setMode);
      setTitle("");
      setIsTitleEdited(false);
      // 调用取消回调
      onCancel();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('保存笔记失败，请重试');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">添加笔记</h1>
      <div className="flex gap-8">
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                标题
              </label>
              <FormatMode
                content={content}
                onContentChange={handleContentChange}
                autoFormat={autoFormat}
                onAutoFormatChange={setAutoFormat}
                formatText={formatText}
              />
            </div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="标题将自动提取，也可以手动编辑"
            />
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
              placeholder="请输入内容，将自动提取标题"
              required
            />
          </div>
          <div className="mb-4">
            {mode === 'quick' ? (
              <QuickTagInput
                tags={tags}
                onChange={setTags}
                onModeChange={setMode}
              />
            ) : (
              <NormalTagInput
                tags={tags}
                onChange={setTags}
                onModeChange={setMode}
              />
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </form>
        <EasyTag onTagSelect={(tag) => {
          if (!tags.includes(tag)) {
            setTags([...tags, tag]);
          }
        }} />
      </div>
    </div>
  );
} 