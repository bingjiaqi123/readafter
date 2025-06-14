// 清理文本中的多余空格
export function cleanText(text: string): string {
  // 按行分割
  const lines = text.split('\n');
  
  // 过滤掉空行，并清理每行的首尾空白
  const cleanedLines = lines
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // 重新用换行符连接
  return cleanedLines.join('\n');
} 