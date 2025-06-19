import { PUNCTUATION_REGEX } from './punctuationDef';
import { getDict } from './manageDict';

/**
 * 处理顿号分割
 * 在顿号处尝试分割长句，确保分割后的句子长度合适
 * 注意：包含顿号的专有词不会被拆分
 */

const MAX_LENGTH = 20;
const MIN_LENGTH = 6;

/**
 * 获取所有需要保护的顿号位置范围
 * @param text 完整文本
 * @returns 需要保护的顿号位置范围数组
 */
async function getProtectedPauseRanges(text: string): Promise<{start: number, end: number}[]> {
  const pauseProperWords = await getDict('pause_proper');
  const protectedRanges: {start: number, end: number}[] = [];
  
  for (const word of pauseProperWords) {
    let searchPos = 0;
    while (true) {
      const wordPos = text.indexOf(word, searchPos);
      if (wordPos === -1) break;
      
      // 记录这个专有词的整个范围
      protectedRanges.push({
        start: wordPos,
        end: wordPos + word.length
      });
      
      searchPos = wordPos + 1;
    }
  }
  
  return protectedRanges;
}

/**
 * 检查顿号位置是否在受保护范围内
 * @param pos 顿号位置
 * @param protectedRanges 受保护的范围数组
 * @returns 如果在受保护范围内返回 true，否则返回 false
 */
function isPauseProtected(pos: number, protectedRanges: {start: number, end: number}[]): boolean {
  return protectedRanges.some(range => pos >= range.start && pos < range.end);
}

/**
 * 尝试在顿号处分割文本
 * @param text 要分割的文本
 * @returns 如果找到合适的分割点，返回分割后的部分；否则返回 null
 */
async function trySplitAtPause(text: string): Promise<string[] | null> {
    const pausePositions: number[] = [];
    let pos = 0;
    
    // 找到所有顿号的位置
    while ((pos = text.indexOf('、', pos)) !== -1) {
        pausePositions.push(pos);
        pos++;
    }

    // 获取所有需要保护的顿号位置范围
    const protectedRanges = await getProtectedPauseRanges(text);

    // 尝试每个顿号位置
    for (const pausePos of pausePositions) {
        // 检查这个顿号是否在受保护范围内
        if (isPauseProtected(pausePos, protectedRanges)) {
            console.log(`顿号位置 ${pausePos} 在受保护范围内，跳过分割`);
            continue; // 跳过这个顿号位置
        }
        
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
            const subSplit = await trySplitAtPause(part1);
            if (subSplit) {
                return [...subSplit, part2];
            }
        }
        
        // 如果第二部分超过20，尝试继续分割第二部分
        if (part2.length > MAX_LENGTH) {
            const subSplit = await trySplitAtPause(part2);
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
export async function handlePauseSplit(sentences: string[]): Promise<string[]> {
    const result: string[] = [];

    for (const sentence of sentences) {
        if (sentence.length > MAX_LENGTH) {
            const split = await trySplitAtPause(sentence);
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