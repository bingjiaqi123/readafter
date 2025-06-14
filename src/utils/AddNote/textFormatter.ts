/**
 * 检查字符是否为标点符号
 * @param char 要检查的字符
 * @returns 是否为标点符号
 */
function isPunctuation(char: string): boolean {
  // 中文标点：，。！？；：""''（）【】《》、…—
  // 英文标点：,.!?;:"'()[]<>/-~`·@#$%^&*_+=|\\ 
  // 注意：某些特殊符号在正则表达式中需要转义
  const punctuationRegex = /[，。！？；：""''（）【】《》、…—,.!?;:"'()\[\]<>\/\-~`·@#$%^&*_+=|\\]/;
  return punctuationRegex.test(char);
}

/**
 * 检查字符是否为汉字
 * @param char 要检查的字符
 * @returns 是否为汉字
 */
function isChinese(char: string): boolean {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(char);
}

/**
 * 检查字符是否为字母
 * @param char 要检查的字符
 * @returns 是否为字母
 */
function isLetter(char: string): boolean {
  const letterRegex = /[a-zA-Z]/;
  return letterRegex.test(char);
}

/**
 * 检查字符是否为数字
 * @param char 要检查的字符
 * @returns 是否为数字
 */
function isNumber(char: string): boolean {
  const numberRegex = /[0-9]/;
  return numberRegex.test(char);
}

/**
 * 检查两个字符之间是否需要保留空格
 * @param prev 前一个字符
 * @param next 后一个字符
 * @returns 是否需要保留空格
 */
function shouldKeepSpace(prev: string, next: string): boolean {
  // 如果前一个或后一个字符为空，不需要保留空格
  if (!prev || !next) return false;

  // 如果任一字符是中文，不需要保留空格
  if (isChinese(prev) || isChinese(next)) return false;

  // 字母和字母之间需要保留空格
  if (isLetter(prev) && isLetter(next)) return true;
  
  // 字母和数字之间需要保留空格
  if ((isLetter(prev) && isNumber(next)) || (isNumber(prev) && isLetter(next))) return true;

  // 其他情况不需要保留空格
  return false;
}

/**
 * 将全角字符转换为半角字符
 * @param text 要转换的文本
 * @returns 转换后的文本
 */
function toHalfWidth(text: string): string {
  // 保留中文标点
  const chinesePunctuation: { [key: string]: string } = {
    '，': '，', '。': '。', '？': '？', '！': '！',
    '；': '；', '：': '：', '、': '、', '…': '…', '—': '—'
  };
  
  // 全角转半角映射
  const fullToHalf: { [key: string]: string } = {
    '，': ',', '．': '.', '？': '?', '！': '!',
    '；': ';', '：': ':', '＂': '"', '＇': "'",
    '（': '(', '）': ')', '［': '[', '］': ']',
    '＜': '<', '＞': '>', '／': '/', '－': '-',
    '～': '~', '｀': '`', '·': '·', '＠': '@',
    '＃': '#', '＄': '$', '％': '%', '＾': '^',
    '＆': '&', '＊': '*', '＿': '_', '＋': '+',
    '＝': '=', '｜': '|', '＼': '\\', '　': ' '
  };

  // 数字和字母的全角转半角映射
  const fullToHalfNumAlpha: { [key: string]: string } = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E',
    'Ｆ': 'F', 'Ｇ': 'G', 'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J',
    'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N', 'Ｏ': 'O',
    'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T',
    'Ｕ': 'U', 'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y',
    'Ｚ': 'Z', 'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd',
    'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i',
    'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n',
    'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's',
    'ｔ': 't', 'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x',
    'ｙ': 'y', 'ｚ': 'z'
  };

  // 合并所有映射
  const allMappings: { [key: string]: string } = { ...chinesePunctuation, ...fullToHalf, ...fullToHalfNumAlpha };
  
  // 使用正则表达式替换所有全角字符
  return text.replace(/[，。！？；：""''（）【】《》、…—,.!?;:"'()\[\]<>\/\-~`·@#$%^&*_+=|\\０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ　]/g, 
    char => allMappings[char] || char);
}

/**
 * 将汉字之间的标点符号转换为中文标点
 * @param text 要处理的文本
 * @returns 处理后的文本
 */
function convertPunctuationBetweenChinese(text: string): string {
  // 英文标点到中文标点的映射（移除引号相关映射）
  const punctuationMap: { [key: string]: string } = {
    ',': '，', '.': '。', '?': '？', '!': '！',
    ';': '；', ':': '：', 
    '(': '（', ')': '）', '[': '【', ']': '】',
    '<': '《', '>': '》', '/': '、', '-': '—',
    '~': '～', '`': '｀', '@': '＠', '#': '＃',
    '$': '＄', '%': '％', '^': '＾', '&': '＆',
    '*': '＊', '_': '＿', '+': '＋', '=': '＝',
    '|': '｜', '\\': '＼'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : '';
    const nextChar = i < text.length - 1 ? text[i + 1] : '';

    // 如果当前字符是标点符号，且前后字符中至少有一个是汉字，则转换为中文标点
    // 跳过英文引号的转换
    if (isPunctuation(char) && char !== '"' && char !== '\'' && 
        (isChinese(prevChar) || isChinese(nextChar))) {
      result += punctuationMap[char] || char;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * 格式化文本
 * 1. 统一标点符号（全角转半角，保留中文标点）
 * 2. 将汉字之间的标点符号转换为中文标点
 * 3. 删除不必要的空格（只在字母和字母、字母和数字之间保留空格）
 * 4. 删除空行
 * 5. 保留非空行的换行
 * 6. 在非标点结尾的行末添加句号
 * @param text 要格式化的文本
 * @returns 格式化后的文本
 */
export function formatText(text: string): string {
  if (!text) return '';

  // 1. 统一标点符号（全角转半角，保留中文标点）
  let formatted = toHalfWidth(text);

  // 2. 将汉字之间的标点符号转换为中文标点
  formatted = convertPunctuationBetweenChinese(formatted);

  // 按行分割文本
  const lines = formatted.split('\n');

  // 处理每一行
  const processedLines = lines
    .map(line => {
      // 去除行首行尾空格
      let processedLine = line.trim();
      
      // 如果是空行，返回空字符串
      if (!processedLine) return '';

      // 处理行内空格
      let result = '';
      let inSpace = false;  // 标记是否在连续空格中
      
      for (let i = 0; i < processedLine.length; i++) {
        const char = processedLine[i];
        const nextChar = processedLine[i + 1];
        const prevChar = i > 0 ? processedLine[i - 1] : '';

        // 处理空格
        if (char === ' ') {
          // 如果前一个字符是中文或标点，直接跳过空格
          if (isChinese(prevChar) || isPunctuation(prevChar)) {
            inSpace = false;
            continue;
          }
          
          // 如果后一个字符是中文或标点，直接跳过空格
          if (isChinese(nextChar) || isPunctuation(nextChar)) {
            inSpace = false;
            continue;
          }
          
          // 检查是否需要保留空格
          if (shouldKeepSpace(prevChar, nextChar)) {
            if (!inSpace) {  // 只在需要保留空格且不在连续空格中时添加
              result += ' ';
              inSpace = true;
            }
          }
          continue;
        }

        // 添加当前字符
        result += char;
        inSpace = false;
      }

      // 检查行尾是否需要添加句号
      const lastChar = result[result.length - 1];
      if (lastChar && !isPunctuation(lastChar)) {
        result += '。';
      }

      return result;
    })
    // 过滤掉空行
    .filter(line => line.length > 0);

  // 重新组合文本
  return processedLines.join('\n');
} 