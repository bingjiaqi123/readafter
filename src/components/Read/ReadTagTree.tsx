import React, { useMemo } from 'react';
import { ReadScheme } from '../../types';
import { buildTagTree, TagNode } from '../../utils/Manage/manageTagTree';
import { calculateSchemeTagCounts } from '../../utils/Read/readTagCount';
import '../../styles/components/common.css';

interface ReadTagTreeProps {
  items: ReadScheme[]; // 跟读方案列表，用于计算标签数量
  onTagSelect: (path: string) => void;
  selectedTags: string[];
  showTagTree?: boolean;
  onToggleTagTree?: (show: boolean) => void;
}

export function ReadTagTree({ 
  items, 
  onTagSelect, 
  selectedTags = [],
  showTagTree = true,
  onToggleTagTree
}: ReadTagTreeProps) {
  // 构建标签树
  const tagTree = useMemo(() => {
    const tagItems = items.flatMap((scheme: ReadScheme) => scheme.tags || [])
      .filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index)
      .map((tag: string) => ({ id: tag, tags: [tag] }));
    return buildTagTree(tagItems);
  }, [items]);

  // 计算每个标签下的方案数量
  const tagCounts = useMemo(() => calculateSchemeTagCounts(items), [items]);

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
    const schemeCount = tagCounts.get(node.fullPath) || 0;

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
          <span className="count">{schemeCount}</span>
        </button>
        {children.length > 0 && (
          <div className="mt-1">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!showTagTree) {
    return (
      <div className="py-2">
        <button
          onClick={() => onToggleTagTree?.(true)}
          className="w-full p-2 text-left text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded flex items-center"
          title="展开标签树"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          展开标签树
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 relative">
      {/* 折叠按钮 */}
      <button
        onClick={() => onToggleTagTree?.(false)}
        className="absolute top-2 right-2 z-10 p-1 bg-white rounded hover:bg-gray-100 border border-gray-200"
        title="折叠标签树"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {renderNode(tagTree)}
    </div>
  );
} 