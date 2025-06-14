import React, { useMemo } from 'react';
import { buildTagTree, TagNode } from '../../utils/Manage/manageTagTree';
import { calculateTagCounts } from '../../utils/Manage/manageTagCount';
import { Note } from '../../types/index';

interface ManageTagTreeProps {
  allTags: string[]; // 所有可用的标签
  onTagSelect?: (tag: string) => void; // 标签选择回调
  selectedTags?: string[]; // 已选中的标签
  style?: 'default' | 'indigo'; // 样式变体
  items: Note[]; // 笔记列表，用于计算标签数量
}

export function ManageTagTree({ 
  allTags, 
  onTagSelect, 
  selectedTags = [],
  style = 'default',
  items = []
}: ManageTagTreeProps) {
  // 构建标签树
  const tagTree = useMemo(() => {
    const items = allTags.map(tag => ({ id: tag, tags: [tag] }));
    return buildTagTree(items);
  }, [allTags]);

  // 计算每个标签下的笔记数量
  const tagCounts = useMemo(() => calculateTagCounts(items), [items]);

  // 递归渲染标签树
  const renderNode = (node: TagNode, level: number = 0): React.ReactNode => {
    if (node.name === 'root') {
      return (
        <>
          {/* 全部选项 */}
          <button
            onClick={() => onTagSelect?.('')}
            className={`block w-full text-left px-2 py-1 rounded mb-2 ${
              selectedTags.length === 0
                ? style === 'indigo' 
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            全部
            <span className="ml-2 text-pink-600 text-sm">
              {items.length}
            </span>
          </button>
          {/* 其他标签 */}
          {Array.from(node.children.values()).map(child => renderNode(child))}
        </>
      );
    }

    const children = Array.from(node.children.values()).sort((a, b) => a.name.localeCompare(b.name));
    const isSelected = selectedTags.includes(node.fullPath);
    
    const selectedStyle = style === 'indigo' 
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-blue-100 text-blue-800';
    
    const hoverStyle = 'hover:bg-gray-100';

    // 计算当前标签下的笔记数量
    const noteCount = tagCounts.get(node.fullPath) || 0;

    return (
      <div key={node.fullPath} style={{ marginLeft: `${level * 20}px` }}>
        <button
          onClick={() => onTagSelect?.(node.fullPath)}
          className={`block w-full text-left px-2 py-1 rounded ${
            isSelected ? selectedStyle : hoverStyle
          }`}
        >
          {node.name}
          <span className="ml-2 text-pink-600 text-sm">
            {noteCount}
          </span>
        </button>
        {children.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {renderNode(tagTree)}
    </div>
  );
} 