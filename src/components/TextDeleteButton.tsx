import React from 'react';

interface TextDeleteButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  className?: string;
  children?: React.ReactNode;
}

export function TextDeleteButton({ 
  onClick, 
  className = '',
  children = '删除'
}: TextDeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-red-600 hover:text-red-800 transition-colors ${className}`}
    >
      {children}
    </button>
  );
} 