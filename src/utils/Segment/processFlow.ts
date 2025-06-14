import { addPunctuationBreaks } from './firstPreBreaks';
import { extractSentences } from './sentenceExtractor';
import { handleLongSentenceSemanticSplit } from './secondDialong';
import { handleShortSentences } from './thirdDialShort';
import { fourthReplace } from './fourthReplace';

interface ProcessContext {
    text: string;
    sentences: { length: number; text: string }[];
}

/**
 * 文本处理流程
 * 1. 添加标点符号断句（firstPreBreaks.ts）
 * 2. 提取句子列表（sentenceExtractor.ts）
 * 3. 处理长句（secondDialong.ts）
 * 4. 处理短句（thirdDialShort.ts）
 * 5. 最终文本替换（fourthReplace.ts）
 */
export async function processText(text: string): Promise<string> {
    // 1. 添加标点符号断句
    const textWithBreaks = addPunctuationBreaks(text);

    // 2. 提取句子列表
    const sentences = extractSentences(textWithBreaks);

    // 3. 处理长句
    const longProcessedText = await handleLongSentenceSemanticSplit(sentences, textWithBreaks);

    // 4. 处理短句
    const context: ProcessContext = { text: longProcessedText, sentences };
    handleShortSentences(context);
    const shortProcessedText = context.text;

    // 5. 最终文本替换
    const finalText = fourthReplace(shortProcessedText);

    return finalText;
} 