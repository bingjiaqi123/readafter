import { getPunctuationPriority, PUNCTUATION_REGEX } from './punctuationDef';

interface SegmentContext {
    text: string;
}

/**
 * 计算文本的非标点字符数
 */
function getNonPunctuationLength(text: string): number {
    return text.replace(PUNCTUATION_REGEX, '').length;
}

/**
 * 获取文本中最后一个标点符号
 */
function getLastPunctuation(text: string): string {
    const match = text.match(/[，。？！；：]$/);
    return match ? match[0] : '';
}

/**
 * 获取文本中第一个标点符号
 */
function getFirstPunctuation(text: string): string {
    const match = text.match(/^[，。？！；：]/);
    return match ? match[0] : '';
}
/**
 * 处理短句
 * 规则：
 * 1. 找出所有非标点字符数小于6的短句
 * 2. 根据标点优先级决定合并方向：
 *    - 如果短句前面的标点优先级高于后面的，优先向后合并
 *    - 如果短句前面的标点优先级低于后面的，优先向前合并
 *    - 优先级相同时，优先向后合并
 */
export function handleShortSentences(context: SegmentContext): void {
    // 按换气符分割文本
    const segments = context.text.split('▼');
    const nonPunctLengths = segments.map(getNonPunctuationLength);
    let i = 0;
    
    while (i < segments.length) {
        // 找出短句（非标点字符数小于6）
        if (nonPunctLengths[i] < 6) {
            // 获取前后段落
            const prevSegment = i > 0 ? segments[i - 1] : '';
            const nextSegment = i < segments.length - 1 ? segments[i + 1] : '';
            
            // 获取前后标点
            const prevPunct = getLastPunctuation(prevSegment);
            const nextPunct = getFirstPunctuation(nextSegment);
            
            // 根据标点优先级决定合并方向
            const prevPriority = getPunctuationPriority(prevPunct);
            const nextPriority = getPunctuationPriority(nextPunct);
            
            let mergeDirection: 'forward' | 'backward';
            if (prevPriority > nextPriority) {
                mergeDirection = 'backward';
            } else if (prevPriority < nextPriority) {
                mergeDirection = 'forward';
            } else {
                // 优先级相同时，优先向后合并
                mergeDirection = 'backward';
            }
            
            // 执行合并
            if (mergeDirection === 'backward' && i < segments.length - 1) {
                // 向后合并
                segments[i] = segments[i] + segments[i + 1];
                segments.splice(i + 1, 1);
                // 更新非标点字符数
                nonPunctLengths[i] = getNonPunctuationLength(segments[i]);
                nonPunctLengths.splice(i + 1, 1);
            } else if (mergeDirection === 'forward' && i > 0) {
                // 向前合并
                segments[i - 1] = segments[i - 1] + segments[i];
                segments.splice(i, 1);
                // 更新非标点字符数
                nonPunctLengths[i - 1] = getNonPunctuationLength(segments[i - 1]);
                nonPunctLengths.splice(i, 1);
                i--; // 回退一步，因为当前段已经合并到前一段
            } else {
                // 无法合并，继续处理下一段
                i++;
            }
        } else {
            i++;
        }
    }
    
    // 更新文本
    context.text = segments.join('▼');
} 