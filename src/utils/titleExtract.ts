/**
 * 从文本中提取标题
 * @param text 原始文本
 * @returns 提取的标题
 */
export function extractTitle(text: string): string {
    if (!text) return '';

    // 定义句子结束标记
    const sentenceEndings = ['.', '。', '?', '？', '!', '！', '\n'];
    
    // 找到第一个句子结束标记的位置
    let firstEndIndex = text.length;
    for (const ending of sentenceEndings) {
        const index = text.indexOf(ending);
        if (index !== -1 && index < firstEndIndex) {
            firstEndIndex = index;
        }
    }

    // 获取第一个句子结束标记之前的内容
    let title = text.slice(0, firstEndIndex).trim();

    // 如果第一个句子超过20个字，则截取前20个字
    if (title.length > 20) {
        title = title.slice(0, 20);
    }

    // 如果提取的标题为空，则使用默认标题
    if (!title) {
        title = '无标题';
    }

    return title;
}

/**
 * 检查标题是否被用户编辑过
 * @param originalTitle 原始标题
 * @param currentTitle 当前标题
 * @returns 是否被编辑过
 */
export function isTitleEdited(originalTitle: string, currentTitle: string): boolean {
    return originalTitle !== currentTitle;
}

/**
 * 获取标题（考虑用户编辑状态）
 * @param text 原始文本
 * @param currentTitle 当前标题
 * @param originalTitle 原始标题
 * @returns 应该使用的标题和是否被编辑过
 */
export function getTitle(text: string, currentTitle: string, originalTitle: string): { title: string; isEdited: boolean } {
    // 如果标题被编辑过，保持当前标题
    if (isTitleEdited(originalTitle, currentTitle)) {
        return { title: currentTitle, isEdited: true };
    }

    // 否则使用提取的标题
    const extractedTitle = extractTitle(text);
    return { 
        title: extractedTitle, 
        isEdited: false 
    };
} 