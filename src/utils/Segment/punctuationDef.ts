/**
 * 标点符号定义
 */

// 所有标点符号的正则表达式
export const PUNCTUATION_REGEX = /[，。！？；：（）【】《》、…—,.!?;:()\[\]<>\/\-~`·@#$%^&*_+=|\\]/;

// 标点符号优先级（用于短句合并）
export const PUNCTUATION_PRIORITY: Record<string, number> = {
    '。': 5,  // 句号
    '！': 5,  // 感叹号
    '？': 5,  // 问号
    '…': 5,   // 省略号
    '.': 5,   // 英文句号
    '!': 5,   // 英文感叹号
    '?': 5,   // 英文问号
    '；': 4,  // 分号
    ';': 4,   // 英文分号
    '，': 3,  // 逗号
    '：': 2,  // 冒号
    '（': 3,  // 括号
    '）': 3,  // 括号
    '【': 3,  // 方括号
    '】': 3,  // 方括号
    '《': 3,  // 书名号
    '》': 3,  // 书名号
    ',': 3,   // 英文逗号
    '(': 3,   // 英文括号
    ')': 3,   // 英文括号
    '[': 3,   // 英文方括号
    ']': 3,   // 英文方括号
    '<': 3,   // 英文尖括号
    '>': 3,   // 英文尖括号
    ':': 2,   // 英文冒号
    '、': 1  // 顿号
};

/**
 * 判断字符是否为标点符号
 */
export function isPunctuation(char: string): boolean {
    return PUNCTUATION_REGEX.test(char);
}

/**
 * 获取标点符号的优先级
 */
export function getPunctuationPriority(char: string): number {
    return PUNCTUATION_PRIORITY[char] || 0;
} 