import { DictCategory, getAllDicts, saveDict, DICT_CATEGORIES } from '../Segment/manageDict';

// 进度回调类型
export type ProgressCallback = (progress: number, message: string) => void;

// 导出词库数据到 JSON 文件
export const exportDict = (onProgress?: ProgressCallback): void => {
  try {
    onProgress?.(0, '准备导出数据...');
    
    // 获取所有词库数据
    const dicts = getAllDicts();
    onProgress?.(20, '获取词库数据完成');
    
    // 构建导出数据
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      categories: Object.entries(dicts).map(([id, words]) => ({
        id,
        words
      }))
    };
    onProgress?.(40, '构建导出数据完成');

    // 转换为 JSON 字符串
    const jsonStr = JSON.stringify(exportData, null, 2);
    onProgress?.(60, '数据序列化完成');
    
    // 创建 Blob 对象
    const blob = new Blob([jsonStr], { type: 'application/json' });
    onProgress?.(80, '创建文件完成');
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dict_export_${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    onProgress?.(90, '开始下载文件');
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onProgress?.(100, '导出完成');
  } catch (error) {
    console.error('导出词库失败:', error);
    throw new Error('导出词库失败');
  }
};

// 导入词库数据
export const importDict = async (file: File, onProgress?: ProgressCallback): Promise<void> => {
  try {
    onProgress?.(0, '开始导入...');
    
    // 读取文件内容
    const text = await file.text();
    onProgress?.(20, '文件读取完成');
    
    const importData = JSON.parse(text);
    onProgress?.(30, '解析 JSON 数据完成');

    // 验证导入数据格式
    if (!importData.version || !importData.categories || !Array.isArray(importData.categories)) {
      throw new Error('无效的词库文件格式');
    }
    onProgress?.(40, '验证文件格式完成');

    // 验证每个分类的数据
    const totalCategories = importData.categories.length;
    for (let i = 0; i < totalCategories; i++) {
      const category = importData.categories[i];
      const progress = 40 + Math.floor((i / totalCategories) * 40);
      
      if (!category.id || !Array.isArray(category.words)) {
        throw new Error('无效的分类数据格式');
      }

      // 验证分类 ID 是否有效
      if (!DICT_CATEGORIES.some(c => c.id === category.id)) {
        throw new Error(`无效的分类 ID: ${category.id}`);
      }

      // 验证词条是否都是字符串
      if (!category.words.every((word: unknown) => typeof word === 'string')) {
        throw new Error(`分类 ${category.id} 包含无效的词条`);
      }

      onProgress?.(progress, `验证分类 ${category.id} 完成`);
    }
    onProgress?.(80, '所有分类验证完成');

    // 保存导入的词库数据
    for (let i = 0; i < totalCategories; i++) {
      const category = importData.categories[i];
      const progress = 80 + Math.floor((i / totalCategories) * 20);
      
      saveDict(category.id as DictCategory, category.words);
      onProgress?.(progress, `保存分类 ${category.id} 完成`);
    }
    
    onProgress?.(100, '导入完成');
  } catch (error) {
    console.error('导入词库失败:', error);
    throw error;
  }
};

// 验证词库文件
export const validateDictFile = async (file: File, onProgress?: ProgressCallback): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        onProgress?.(0, '开始验证文件...');
        const text = e.target?.result as string;
        onProgress?.(30, '文件读取完成');
        
        const data = JSON.parse(text);
        onProgress?.(60, '解析 JSON 数据完成');
        
        // 基本格式验证
        if (!data.version || !data.categories || !Array.isArray(data.categories)) {
          onProgress?.(100, '验证失败：无效的文件格式');
          resolve(false);
          return;
        }

        // 验证每个分类
        const isValid = data.categories.every((category: any) => {
          return (
            category.id &&
            Array.isArray(category.words) &&
            category.words.every((word: unknown) => typeof word === 'string') &&
            DICT_CATEGORIES.some(c => c.id === category.id)
          );
        });

        onProgress?.(100, isValid ? '验证完成' : '验证失败：无效的分类数据');
        resolve(isValid);
      } catch {
        onProgress?.(100, '验证失败：文件解析错误');
        resolve(false);
      }
    };

    reader.onerror = () => {
      onProgress?.(100, '验证失败：文件读取错误');
      reject(new Error('读取文件失败'));
    };

    reader.readAsText(file);
  });
}; 