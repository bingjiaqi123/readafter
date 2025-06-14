// 定义词库分类类型
export type DictCategory = 
  | 'proper'      // 专有词
  | 'no_split_before'  // 词前不拆
  | 'no_split_after'   // 词后不拆
  | 'number'           // 数字
  | 'no_number_after'  // 数字后不拆
  | 'no_number_before'; // 数字前不拆

// 定义词库分类
export const DICT_CATEGORIES = [
  {
    id: 'proper' as DictCategory,
    name: '专有词',
    description: '专有名词，如人名、地名等',
    file: 'proper.txt'
  },
  {
    id: 'no_split_before' as DictCategory,
    name: '之前不拆',
    description: '美丽的，的之前不拆',
    file: 'no_split_before.txt'
  },
  {
    id: 'no_split_after' as DictCategory,
    name: '之后不拆',
    description: '和我们，和之后不拆',
    file: 'no_split_after.txt'
  },
  {
    id: 'number' as DictCategory,
    name: '数字',
    description: '能跟序数或量词接在一起的',
    file: 'number.txt'
  },
  {
    id: 'no_number_after' as DictCategory,
    name: '数字后不拆',
    description: '这些词在数字后面不能添加换气点，如"个"、"只"等',
    file: 'no_number_after.txt'
  },
  {
    id: 'no_number_before' as DictCategory,
    name: '数字前不拆',
    description: '这些词在数字前面不能添加换气点，如"第"、"周"等',
    file: 'no_number_before.txt'
  }
] as const;

// 从分类定义中获取分类信息
export const DICT_CATEGORIES_OBJ = DICT_CATEGORIES.map(category => ({
  id: category.id,
  name: category.name
}));

// 缓存默认词库数据
let defaultDictCache: Partial<Record<DictCategory, string[]>> = {};

// 获取默认词库
const getDefaultDict = async (category: DictCategory): Promise<string[]> => {
  // 如果缓存中有数据，直接返回
  if (defaultDictCache[category]) {
    return defaultDictCache[category]!;
  }

  try {
    // 获取对应的文件路径
    const categoryInfo = DICT_CATEGORIES.find(c => c.id === category);
    if (!categoryInfo) return [];

    // 读取文件内容
    const response = await fetch(`/src/data/dict/${categoryInfo.file}`);
    if (!response.ok) return [];

    const text = await response.text();
    // 按行分割，过滤空行，去除每行首尾空白
    const words = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // 缓存结果
    defaultDictCache[category] = words;
    return words;
  } catch (error) {
    console.error(`Error loading dictionary for ${category}:`, error);
    return [];
  }
};

// 从 localStorage 获取词库，如果没有则返回默认词库
export const getDict = async (category: DictCategory): Promise<string[]> => {
  const savedDict = localStorage.getItem(`dict_${category}`);
  if (savedDict) {
    try {
      return JSON.parse(savedDict);
    } catch {
      return getDefaultDict(category);
    }
  }
  return getDefaultDict(category);
};

// 保存词库到 localStorage
export const saveDict = (category: DictCategory, words: string[]): void => {
  localStorage.setItem(`dict_${category}`, JSON.stringify(words));
};

// 获取所有词库
export const getAllDicts = async (): Promise<Record<DictCategory, string[]>> => {
  const result: Partial<Record<DictCategory, string[]>> = {};
  await Promise.all(
    DICT_CATEGORIES.map(async category => {
      result[category.id] = await getDict(category.id);
    })
  );
  return result as Record<DictCategory, string[]>;
};

// 重置指定分类的词库到默认值
export const resetDict = async (category: DictCategory): Promise<void> => {
  const defaultDict = await getDefaultDict(category);
  saveDict(category, defaultDict);
};

// 重置所有词库到默认值
export const resetAllDicts = async (): Promise<void> => {
  await Promise.all(
    DICT_CATEGORIES.map(category => resetDict(category.id))
  );
};

// 检查是否是专有词
export async function isProperNoun(word: string): Promise<boolean> {
  const dict = await getDict('proper');
  return dict.includes(word);
}

/**
 * 检查是否是词前不拆词
 */
export async function isNoSplitBefore(word: string): Promise<boolean> {
  const dict = await getDict('no_split_before');
  return dict.includes(word);
}

/**
 * 检查是否是词后不拆词
 */
export async function isNoSplitAfter(word: string): Promise<boolean> {
  const dict = await getDict('no_split_after');
  return dict.includes(word);
} 