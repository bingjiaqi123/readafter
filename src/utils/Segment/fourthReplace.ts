/**
 * 最终文本替换处理
 * 在 addBreathingPoints 之后使用
 * 规则：
 * 1. 在文本最后添加一个▼
 * 2. 把"▼▼"替换成"▼"，循环直到不存在"▼▼"
 * 3. 删除文段开头的"。▼"（没有就跳过）
 */
export function fourthReplace(text: string): string {
    let result = text;

    // 1. 在文本最后添加一个▼（如果最后一个字符不是▼）
    if (result[result.length - 1] !== '▼') {
        result = result + '▼';
    }
    
    // 2. 把"▼▼"替换成"▼"，循环直到不存在"▼▼"
    let hasDoubleBreaks = true;
    while (hasDoubleBreaks) {
        const newResult = result.replace(/▼▼/g, '▼');
        hasDoubleBreaks = newResult !== result;
        result = newResult;
    }
    
    // 3. 删除文段开头的"。"
    // 先按换行符分割文本
    const lines = result.split('\n');
    // 处理每一行，删除开头的"。"
    const processedLines = lines.map(line => {
        if (line.startsWith('。')) {
            return line.slice(1);
        }
        return line;
    });
    // 重新组合文本
    result = processedLines.join('\n');
    
    return result;
} 