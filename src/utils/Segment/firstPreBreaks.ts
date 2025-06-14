/**
 * 添加标点符号断句
 * 1. 处理段落（在每段开头添加。▼）
 * 2. 处理部分标点符号（添加▼）
 */
export function addPunctuationBreaks(text: string): string {
    console.log('Original text:', text);
    
    // 1. 处理段落
    const lines = text.split('\n');
    
    const processedLines = lines.map(line => {
        const trimmedLine = line.trim();
        const result = trimmedLine ? '。' + trimmedLine : '';
        return result;
    });
    const textWithBreaks = processedLines.join('\n');

    // 2. 处理部分标点符号
    const finalResult = textWithBreaks.replace(/[，。？！：；]/g, '$&▼');
    
    return finalResult;
} 