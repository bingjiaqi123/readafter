import React, { useMemo } from 'react';
import { Note } from '../../types/index';
import { buildTagTree, TagNode } from '../../utils/Manage/manageTagTree';
import { calculateTagCounts } from '../../utils/Manage/manageTagCount';
import '../../styles/components/common.css';

interface ManageTagTreeProps {
  items: Note[]; // 笔记列表，用于计算标签数量
  onTagSelect: (path: string) => void;
  selectedTags: string[];
}

export function ManageTagTree({ 
  items, 
  onTagSelect, 
  selectedTags = []
}: ManageTagTreeProps) {
  // 构建标签树
  const tagTree = useMemo(() => {
    const tagItems = items.flatMap((note: Note) => note.tags)
      .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index)
      .map((tag: string) => ({ id: tag, tags: [tag] }));
    return buildTagTree(tagItems);
  }, [items]);

  // 计算每个标签下的笔记数量
  const tagCounts = useMemo(() => calculateTagCounts(items), [items]);

  // 递归渲染标签树
  const renderNode = (node: TagNode, level: number = 0): React.ReactNode => {
    if (node.name === 'root') {
      return (
        <>
          {/* 全部选项 */}
          <div className="tag-tree-node" data-level={0}>
            <button
              onClick={() => onTagSelect?.('')}
              className={selectedTags.length === 0 ? 'selected' : ''}
            >
              <span>全部</span>
              <span className="count">{items.length}</span>
            </button>
          </div>
          {/* 其他标签 */}
          {Array.from(node.children.values())
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(child => renderNode(child, 1))}
        </>
      );
    }

    const children = Array.from(node.children.values()).sort((a, b) => a.name.localeCompare(b.name));
    const isSelected = selectedTags.includes(node.fullPath);
    const noteCount = tagCounts.get(node.fullPath) || 0;

    return (
      <div
        key={node.fullPath}
        className="tag-tree-node"
        data-level={level}
      >
        <button
          onClick={() => onTagSelect?.(node.fullPath)}
          className={isSelected ? 'selected' : ''}
        >
          <span>{node.name}</span>
          <span className="count">{noteCount}</span>
        </button>
        {children.length > 0 && (
          <div className="mt-1">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2">
      {renderNode(tagTree)}
    </div>
  );
} 