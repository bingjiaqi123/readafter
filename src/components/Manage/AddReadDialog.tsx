import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { extractSentences } from '../../utils/Segment/sentenceExtractor';
import { addPunctuationBreaks } from '../../utils/Segment/firstPreBreaks';
import { handleShortSentences } from '../../utils/Segment/thirdDialShort';
import { fourthReplace } from '../../utils/Segment/fourthReplace';
import { handleLongSentenceSemanticSplit } from '../../utils/Segment/secondDialong';
import { Note } from '../../types/index';
import { getTitle } from '../../utils/titleExtract';

interface AddReadDialogProps {
    note: Note;
    onClose: () => void;
    onAdd: (noteId: string, text: string, title?: string) => void;
}

export function AddReadDialog({ note, onClose, onAdd }: AddReadDialogProps) {
    const [finalText, setFinalText] = useState('');
    const [title, setTitle] = useState(note.title);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    const [isTitleEdited, setIsTitleEdited] = useState(false);

    useEffect(() => {
        async function processContent() {
            if (note.content) {
                setIsProcessing(true);
                try {
                    // 1. 处理长句
                    const textWithBreaks = addPunctuationBreaks(note.content);
                    const sentences = extractSentences(textWithBreaks);

                    const longProcessedText = await handleLongSentenceSemanticSplit(sentences, textWithBreaks);

                    // 2. 处理短句
                    const context = { text: longProcessedText };
                    handleShortSentences(context);

                    // 3. 最终文本替换
                    const finalResult = fourthReplace(context.text);
                    setFinalText(finalResult);

                    // 4. 提取标题（如果标题未被编辑过）
                    if (!isTitleEdited) {
                        const { title: extractedTitle } = getTitle(finalResult, title, note.title);
                        setTitle(extractedTitle);
                    }
                } catch (error) {
                    console.error('处理文本时出错:', error);
                } finally {
                    setIsProcessing(false);
                }
            }
        }

        processContent();
    }, [note.content, note.title, isTitleEdited]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setFinalText(newText);
        setCursorPosition(e.target.selectionStart);

        // 如果标题未被编辑过，尝试更新标题
        if (!isTitleEdited) {
            const { title: extractedTitle } = getTitle(newText, title, note.title);
            setTitle(extractedTitle);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setIsTitleEdited(true);
    };

    const handleInsertMark = () => {
        if (cursorPosition === null) return;

        const before = finalText.slice(0, cursorPosition);
        const after = finalText.slice(cursorPosition);
        const newText = before + "▼" + after;
        setFinalText(newText);
        setCursorPosition(cursorPosition + 1);
    };

    const handleSave = () => {
        onAdd(note.id, finalText, title);
        onClose();
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            className="fixed inset-0 z-50 overflow-y-auto"
        >
            <div className="flex items-center justify-center min-h-screen">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

                <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">
                        添加跟读方案
                    </Dialog.Title>

                    <div className="space-y-4">
                        {/* 标题输入框 */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                标题
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入标题"
                                disabled={isProcessing}
                            />
                        </div>

                        {/* 处理状态显示 */}
                        {isProcessing && (
                            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
                                正在处理文本...
                            </div>
                        )}

                        {/* 内容输入框 */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                内容
                            </label>
                            <textarea
                                id="content"
                                value={finalText}
                                onChange={handleTextChange}
                                onSelect={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    setCursorPosition(target.selectionStart);
                                }}
                                className="w-full h-64 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入跟读方案"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={handleInsertMark}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            插入标记
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}