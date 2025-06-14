import React from 'react';

interface ReadTagTreeProps {
  allTags: string[]; // 所有可用的标签
  onTagSelect?: (tag: string) => void; // 标签选择回调
  selectedTags?: string[]; // 已选中的标签
  style?: 'default' | 'indigo'; // 样式变体
  schemes: any[]; // 跟读方案列表，用于计算标签数量
}

export function ReadTagTree({ 
  allTags, 
  onTagSelect, 
  selectedTags = [],
  style = 'default',
  schemes = []
}: ReadTagTreeProps) {
  // 递归渲染标签树
  const renderNode = (node: any, level: number = 0): React.ReactNode => {
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
              {schemes.length}
            </span>
          </button>
          {/* 其他标签 */}
          {Array.from(node.children.values()).map(child => renderNode(child))}
        </>
      );
    }

    const children = Array.from(node.children.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
    const isSelected = selectedTags.includes(node.fullPath);
    
    const selectedStyle = style === 'indigo' 
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-blue-100 text-blue-800';
    
    const hoverStyle = 'hover:bg-gray-100';

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
            {schemes.length}
          </span>
        </button>
        {children.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {renderNode({ name: 'root', children: new Map() })}
    </div>
  );
} 