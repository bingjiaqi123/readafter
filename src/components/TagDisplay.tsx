import { useState } from 'react';

interface TagDisplayProps {
  tags: string[];
  maxDisplayCount?: number;
  className?: string;
  onTagClick?: (tag: string) => void;
}

export function TagDisplay({ 
  tags, 
  maxDisplayCount = 3, 
  className = '',
  onTagClick 
}: TagDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) return null;

  const displayTags = isExpanded ? tags : tags.slice(0, maxDisplayCount);
  const hasMoreTags = tags.length > maxDisplayCount;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <span
            key={tag}
            onClick={() => onTagClick?.(tag)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 ${
              onTagClick ? 'cursor-pointer hover:bg-blue-200' : ''
            }`}
          >
            {tag}
          </span>
        ))}
        {hasMoreTags && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            +{tags.length - maxDisplayCount} 更多
          </button>
        )}
        {hasMoreTags && isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            收起
          </button>
        )}
      </div>
    </div>
  );
} 