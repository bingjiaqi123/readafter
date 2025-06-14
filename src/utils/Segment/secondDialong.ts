import { getDict } from './manageDict';
import { handlePauseSplit } from './pauseSplitter';

const MAX_SENTENCE_LENGTH = 20;
const MAX_RECURSION_DEPTH = 3;

// 分词结果接口
interface WordSegment {
    word: string;
    start: number;
    end: number;
}

/**
 * 对文本进行分词
 * 使用词典中的词进行最大正向匹配
 */
async function segmentText(text: string): Promise<WordSegment[]> {
    const segments: WordSegment[] = [];
    let pos = 0;
    
    // 获取所有词典中的词
    const [properWords, noSplitBeforeWords, noSplitAfterWords, numberWords, noNumberAfterWords, noNumberBeforeWords] = await Promise.all([
        getDict('proper'),
        getDict('no_split_before'),
        getDict('no_split_after'),
        getDict('number'),
        getDict('no_number_after'),
        getDict('no_number_before')
    ]);

    const allWords = [
        ...properWords,
        ...noSplitBeforeWords,
        ...noSplitAfterWords,
        ...numberWords,
        ...noNumberAfterWords,
        ...noNumberBeforeWords
    ].sort((a, b) => b.length - a.length); // 按长度降序排序，优先匹配长词

    while (pos < text.length) {
        let found = false;
        
        // 尝试匹配词典中的词
        for (const word of allWords) {
            if (text.slice(pos).startsWith(word)) {
                segments.push({
                    word,
                    start: pos,
                    end: pos + word.length
                });
                pos += word.length;
                found = true;
                break;
            }
        }
        
        // 如果没有匹配到词典中的词，按单字处理
        if (!found) {
            segments.push({
                word: text[pos],
                start: pos,
                end: pos + 1
            });
            pos += 1;
        }
    }
    
    return segments;
}

/**
 * 处理长句的语义分割
 * 输入：
 * - sentences: sentenceExtractor.ts 提取的句子列表
 * - originalText: 得到后的文本
 * 输出：处理后的文本
 */
export async function handleLongSentenceSemanticSplit(sentences: { length: number; text: string }[], originalText: string): Promise<string> {
    let result = originalText;
    
    console.log('开始处理长句语义分割，输入句子数:', sentences.length);
    
    // 处理每个句子
    for (const sentence of sentences) {
        console.log('处理句子:', sentence.text);
        console.log('句子长度:', sentence.length);
        
        if (sentence.length > MAX_SENTENCE_LENGTH) {
            console.log('句子超过长度限制，进行顿号分割');
            // 1. 先进行顿号分割
            const pauseSplitResult = handlePauseSplit([sentence.text]);
            console.log('顿号分割结果:', pauseSplitResult);
            
            // 2. 对顿号分割后的每个部分进行语义分割
            const processedParts = await Promise.all(pauseSplitResult.map(async part => {
                console.log('处理顿号分割后的部分:', part);
                // 如果分割后的部分仍然超过长度限制，进行语义分割
                if (part.length > MAX_SENTENCE_LENGTH) {
                    console.log('部分超过长度限制，进行语义分割');
                    return processSentence(part);
                }
                return part;
            }));

            const processed = processedParts.join('▼');
            console.log('最终处理结果:', processed);
            const escapedOriginal = sentence.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(escapedOriginal, 'g'), processed);
        }
    }
    
    return result;
}

/**
 * 处理单个句子
 * 如果句子长度超过限制，尝试在合适的位置分割
 */
async function processSentence(sentence: string, depth: number = 0): Promise<string> {
    console.log('processSentence 输入:', sentence, '深度:', depth);
    
    // 检查递归深度
    if (depth >= MAX_RECURSION_DEPTH) {
        console.log('达到最大递归深度，返回原句');
        return sentence;
    }

    // 如果句子长度在限制内，直接返回
    if (sentence.length <= MAX_SENTENCE_LENGTH) {
        console.log('句子长度在限制内，直接返回');
        return sentence;
    }

    // 1. 先进行分词
    const segments = await segmentText(sentence);
    console.log('分词结果:', segments.map(s => s.word).join(' '));

    // 2. 根据词典规则和长度限制找到合适的分割点
    const splitPos = await findBestSplitPointWithSegments(segments, sentence);
    console.log('找到的分割点:', splitPos);
    
    if (splitPos === undefined) {
        console.log('未找到合适的分割点，返回原句');
        return sentence;
    }

    // 分割句子
    const firstPart = sentence.slice(0, splitPos);
    const secondPart = sentence.slice(splitPos);
    console.log('分割结果:', { firstPart, secondPart });

    // 递归处理两个部分
    const [firstResult, secondResult] = await Promise.all([
        processSentence(firstPart, depth + 1),
        processSentence(secondPart, depth + 1)
    ]);

    // 合并结果，在中间添加▼
    const result = firstResult + '▼' + secondResult;
    console.log('合并结果:', result);
    return result;
}

/**
 * 根据分词结果找到最佳分割点
 */
async function findBestSplitPointWithSegments(segments: WordSegment[], text: string): Promise<number | undefined> {
    if (segments.length <= 1) return undefined;

    const midPoint = Math.floor(text.length / 2);
    let bestPos = -1;
    let minDistance = Infinity;

    // 遍历所有可能的分割点（词与词之间）
    for (let i = 0; i < segments.length - 1; i++) {
        const currentWord = segments[i];
        const pos = currentWord.end;

        // 检查分割点是否合法
        const isValid = await isValidSplitPointWithSegments(segments, i);
        if (!isValid) {
            continue;
        }

        const distance = Math.abs(pos - midPoint);
        if (distance < minDistance || (distance === minDistance && pos < bestPos)) {
            minDistance = distance;
            bestPos = pos;
        }
    }

    return bestPos === -1 ? undefined : bestPos;
}

/**
 * 检查分词后的分割点是否合法
 */
async function isValidSplitPointWithSegments(segments: WordSegment[], pos: number): Promise<boolean> {
    if (pos < 0 || pos >= segments.length - 1) return false;

    const currentWord = segments[pos].word;
    const nextWord = segments[pos + 1].word;

    // 获取所有需要的词典
    const [numberWords, noNumberAfterWords, noNumberBeforeWords, noSplitBeforeWords, noSplitAfterWords] = await Promise.all([
        getDict('number'),
        getDict('no_number_after'),
        getDict('no_number_before'),
        getDict('no_split_before'),
        getDict('no_split_after')
    ]);

    // 规则1：数字和数字后不拆词之间不能分割
    if (numberWords.includes(currentWord) && noNumberAfterWords.includes(nextWord)) {
        console.log('规则1：数字和数字后不拆词之间不能分割');
        return false;
    }
    
    // 规则2：数字和数字前不拆词之间不能分割
    if (numberWords.includes(nextWord) && noNumberBeforeWords.includes(currentWord)) {
        console.log('规则2：数字和数字前不拆词之间不能分割');
        return false;
    }

    // 规则3：词前不拆
    if (noSplitBeforeWords.includes(currentWord)) {
        console.log('规则3：词前不拆:', currentWord);
        return false;
    }
    
    // 规则4：词后不拆
    if (noSplitAfterWords.includes(nextWord)) {
        console.log('规则4：词后不拆:', nextWord);
        return false;
    }

    console.log('分割点合法');
    return true;
}

/**
 * 获取所有可能的词
 */
async function getAllPossibleWords(text: string): Promise<{ word: string; start: number; end: number }[]> {
    const words: { word: string; start: number; end: number }[] = [];
    
    // 获取所有词典中的词
    const [properWords, noSplitBeforeWords, noSplitAfterWords, numberWords, noNumberAfterWords, noNumberBeforeWords] = await Promise.all([
        getDict('proper'),
        getDict('no_split_before'),
        getDict('no_split_after'),
        getDict('number'),
        getDict('no_number_after'),
        getDict('no_number_before')
    ]);

    const allDictWords = [
        ...properWords,
        ...noSplitBeforeWords,
        ...noSplitAfterWords,
        ...numberWords,
        ...noNumberAfterWords,
        ...noNumberBeforeWords
    ];

    for (const word of allDictWords) {
        let pos = 0;
        while (pos < text.length) {
            const index = text.indexOf(word, pos);
            if (index === -1) break;
            words.push({
                word,
                start: index,
                end: index + word.length
            });
            pos = index + 1;
        }
    }

    return words.sort((a, b) => a.start - b.start);
}

/**
 * 检查分割点是否合法
 */
async function isValidSplitPoint(text: string, pos: number): Promise<boolean> {
    if (pos <= 0 || pos >= text.length) return false;

    const currentChar = text[pos - 1];
    const nextChar = text[pos];

    // 获取所有需要的词典
    const [numberWords, noNumberAfterWords, noNumberBeforeWords, noSplitBeforeWords, noSplitAfterWords] = await Promise.all([
        getDict('number'),
        getDict('no_number_after'),
        getDict('no_number_before'),
        getDict('no_split_before'),
        getDict('no_split_after')
    ]);

    // 规则1：数字和数字后不拆词之间不能分割
    if (numberWords.includes(currentChar) && noNumberAfterWords.includes(nextChar)) {
        console.log('规则1：数字和数字后不拆词之间不能分割');
        return false;
    }
    
    // 规则2：数字和数字前不拆词之间不能分割
    if (numberWords.includes(nextChar) && noNumberBeforeWords.includes(currentChar)) {
        console.log('规则2：数字和数字前不拆词之间不能分割');
        return false;
    }

    // 规则3：词前不拆
    if (noSplitBeforeWords.includes(currentChar)) {
        console.log('规则3：词前不拆:', currentChar);
        return false;
    }
    
    // 规则4：词后不拆
    if (noSplitAfterWords.includes(nextChar)) {
        console.log('规则4：词后不拆:', nextChar);
        return false;
    }

    console.log('分割点合法');
    return true;
}

/**
 * 获取所有可能的分割点
 */
export async function getAllPossibleSplitPoints(text: string): Promise<number[]> {
    const words = await getAllPossibleWords(text);
    const splitPoints: number[] = [];
    
    // 遍历所有词对
    for (let i = 0; i < words.length - 1; i++) {
        const currentWord = words[i];
        
        // 检查当前词和下一个词之间是否可以分割
        const canSplit = await isValidSplitPoint(text, currentWord.end);
        if (canSplit) {
            splitPoints.push(currentWord.end);
        }
    }
    
    return splitPoints;
}

/**
 * 对文本进行分词并添加换气点
 */
export async function addBreathingPoints(text: string): Promise<string> {
    // 先进行分词
    const segments = await segmentText(text);
    
    // 添加换气点
    let resultWithBreathing = '';
    for (let i = 0; i < segments.length - 1; i++) {
        const currentSegment = segments[i];
        
        // 检查是否需要添加换气点
        const shouldAddBreathing = await isValidSplitPointWithSegments(segments, i);
        
        resultWithBreathing += currentSegment.word;
        if (shouldAddBreathing) {
            resultWithBreathing += '|';
        }
    }
    
    // 添加最后一个词
    if (segments.length > 0) {
        resultWithBreathing += segments[segments.length - 1].word;
    }
    
    return resultWithBreathing;
}

