import React from "react";

interface FormatModeProps {
  content: string;
  onContentChange: (content: string) => void;
  autoFormat: boolean;
  onAutoFormatChange: (autoFormat: boolean) => void;
  formatText: (text: string) => string;
}

export const FormatMode: React.FC<FormatModeProps> = ({ content, onContentChange, autoFormat, onAutoFormatChange, formatText }) => {
  const handleFormat = () => {
    onContentChange(formatText(content));
  };

  return (
    <div className="flex items-center space-x-4">
      <label className="flex items-center space-x-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={autoFormat}
          onChange={(e) => onAutoFormatChange(e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span>保存时自动调整格式</span>
      </label>
      <button
        type="button"
        onClick={handleFormat}
        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded hover:bg-blue-50"
      >
        一键调整格式
      </button>
    </div>
  );
}; 