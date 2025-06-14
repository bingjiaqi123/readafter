/**
 * 提取文本中的句子列表
 * 按逗号、句号、问号、感叹号、冒号、分号、换气符分割文本
 * 返回每个句子的长度和文本
 */
export function extractSentences(text: string): { length: number; text: string }[] {
    // 按逗号、句号、问号、感叹号、冒号、分号、换气符分割文本
    const sentences = text.split(/[，。？！：；▼]/);
    
    // 过滤掉空句子，并计算每个句子的长度
    return sentences
        .filter(sentence => sentence.trim().length > 0)
        .map(sentence => ({
            length: sentence.length,
            text: sentence.trim()
        }));
} 