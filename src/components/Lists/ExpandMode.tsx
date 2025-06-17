// import React from 'react';

interface ExpandModeProps {
  mode: 'title-only' | 'collapsed' | 'expanded';
  onToggle: () => void;
}

export function ExpandMode({ mode, onToggle }: ExpandModeProps) {
  const getTitle = () => {
    switch (mode) {
      case 'title-only':
        return "展开列表";
      case 'collapsed':
        return "展开列表";
      case 'expanded':
        return "收起列表";
      default:
        return "展开列表";
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'title-only':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'collapsed':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'expanded':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 transform rotate-90"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`hover:text-gray-700 transition-colors ${
        mode === 'title-only' ? 'text-gray-400' : 'text-gray-500'
      }`}
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
} 