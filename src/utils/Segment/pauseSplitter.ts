import { PUNCTUATION_REGEX } from './punctuationDef';

/**
 * 处理顿号分割
 * 在顿号处尝试分割长句，确保分割后的句子长度合适
 */

const MAX_LENGTH = 20;
const MIN_LENGTH = 6;

/**
 * 尝试在顿号处分割文本
 * @param text 要分割的文本
 * @returns 如果找到合适的分割点，返回分割后的部分；否则返回 null
 */
function trySplitAtPause(text: string): string[] | null {
    const pausePositions: number[] = [];
    let pos = 0;
    
    // 找到所有顿号的位置
    while ((pos = text.indexOf('、', pos)) !== -1) {
        pausePositions.push(pos);
        pos++;
    }

    // 尝试每个顿号位置
    for (const pausePos of pausePositions) {
        const part1 = text.slice(0, pausePos + 1);
        const part2 = text.slice(pausePos + 1);
        
        // 检查分割后的不计标点的字符数
        const cleanPart1 = part1.replace(PUNCTUATION_REGEX, '');
        const cleanPart2 = part2.replace(PUNCTUATION_REGEX, '');
        
        // 如果任一部分不计标点的字符数小于6，跳过这个顿号位置
        if (cleanPart1.length < MIN_LENGTH || cleanPart2.length < MIN_LENGTH) {
            continue;
        }
        
        // 检查计标点的字符数是否都小于等于20
        if (part1.length <= MAX_LENGTH && part2.length <= MAX_LENGTH) {
            return [part1, part2];
        }
        
        // 如果第一部分超过20，尝试继续分割第一部分
        if (part1.length > MAX_LENGTH) {
            const subSplit = trySplitAtPause(part1);
            if (subSplit) {
                return [...subSplit, part2];
            }
        }
        
        // 如果第二部分超过20，尝试继续分割第二部分
        if (part2.length > MAX_LENGTH) {
            const subSplit = trySplitAtPause(part2);
            if (subSplit) {
                return [part1, ...subSplit];
            }
        }
    }
    
    return null;
}

/**
 * 处理长句的顿号分割
 * @param sentences 句子列表
 * @returns 处理后的句子列表
 */
export function handlePauseSplit(sentences: string[]): string[] {
    const result: string[] = [];

    for (const sentence of sentences) {
        if (sentence.length > MAX_LENGTH) {
            const split = trySplitAtPause(sentence);
            if (split) {
                result.push(...split);
            } else {
                result.push(sentence);
            }
        } else {
            result.push(sentence);
        }
    }

    return result;
}