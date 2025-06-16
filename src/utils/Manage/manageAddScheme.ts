import { Note, ReadScheme } from '../../types';
import { extractSentences } from '../Segment/sentenceExtractor';
import { addPunctuationBreaks } from '../Segment/firstPreBreaks';
import { handleShortSentences } from '../Segment/thirdDialShort';
import { fourthReplace } from '../Segment/fourthReplace';
import { handleLongSentenceSemanticSplit } from '../Segment/secondDialong';
import { getTitle } from '../titleExtract';

/**
 * 为笔记内容添加气口标记
 * @param content 笔记内容
 * @returns 处理后的文本
 */
export async function addBreathingPointsToText(content: string): Promise<string> {
    if (!content) return '';
    
    try {
        // 1. 处理长句
        const textWithBreaks = addPunctuationBreaks(content);
        const sentences = extractSentences(textWithBreaks);

        const longProcessedText = await handleLongSentenceSemanticSplit(sentences, textWithBreaks);

        // 2. 处理短句
        const context = { text: longProcessedText };
        handleShortSentences(context);

        // 3. 最终文本替换
        const finalResult = fourthReplace(context.text);
        
        return finalResult;
    } catch (error) {
        console.error('处理文本时出错:', error);
        return content; // 如果处理失败，返回原文本
    }
}

/**
 * 批量创建跟读方案
 * @param noteIds 笔记ID数组
 * @param notes 所有笔记列表
 * @returns 新的跟读方案数组
 */
export async function createSchemesFromNotes(noteIds: string[], notes: Note[]): Promise<ReadScheme[]> {
    const newSchemes: ReadScheme[] = [];
    
    for (const noteId of noteIds) {
        const note = notes.find(n => n.id === noteId);
        if (!note) continue;

        // 为笔记内容添加气口标记
        const processedText = await addBreathingPointsToText(note.content);
        
        // 提取标题
        const { title: extractedTitle } = getTitle(processedText, note.title, note.title);

        const scheme: ReadScheme = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            noteId: note.id,
            text: processedText,
            title: extractedTitle,
            timestamp: new Date().toISOString(),
            tags: note.tags || [],
            isTitleEdited: false
        };
        
        newSchemes.push(scheme);
    }
    
    return newSchemes;
} 