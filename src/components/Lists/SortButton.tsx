import { TinyDeleteButton } from '../TinyDeleteButton';

interface SortButtonProps {
  onMove: (direction: 'top' | 'up' | 'down' | 'bottom') => void;
  onRemove: () => void;
}

export function SortButton({ onMove, onRemove }: SortButtonProps) {
  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onMove('top')}
        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
        title="置顶"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7M5 9l7-7 7 7" />
        </svg>
      </button>
      <button
        onClick={() => onMove('up')}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        title="上移"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l5-5 5 5" />
        </svg>
      </button>
      <button
        onClick={() => onMove('down')}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        title="下移"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l5 5 5-5" />
        </svg>
      </button>
      <button
        onClick={() => onMove('bottom')}
        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
        title="置底"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7M19 15l-7 7-7-7" />
        </svg>
      </button>
      <TinyDeleteButton onClick={onRemove} />
    </div>
  );
} 