import { Note, ReadList, ReadScheme } from '../types';

interface QuickPhrase {
  text: string;
  isPinned: boolean;
}

interface AppData {
  notes: Note[];
  readLists: ReadList[];
  readSchemes: ReadScheme[];
  quickPhrases: QuickPhrase[];
}

export const exportData = async (data: AppData): Promise<void> => {
  try {
    // 从 localStorage 获取完整的快捷短语数据
    const quickPhrasesData = localStorage.getItem('quickPhrases');
    if (!quickPhrasesData) {
      throw new Error('快捷短语数据不存在');
    }
    
    const quickPhrases = JSON.parse(quickPhrasesData);
    if (!Array.isArray(quickPhrases) || !quickPhrases.every(p => typeof p === 'object' && 'text' in p && 'isPinned' in p)) {
      throw new Error('快捷短语数据格式不正确');
    }

    const exportData = {
      ...data,
      quickPhrases
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `readafter-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出数据时出错:', error);
    throw new Error('导出数据失败');
  }
};

export const importData = async (): Promise<AppData | null> => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    const file = await new Promise<File | null>((resolve) => {
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        resolve(files ? files[0] : null);
      };
      input.click();
    });

    if (!file) {
      return null;
    }

    const text = await file.text();
    const data = JSON.parse(text) as AppData;

    // 验证导入的数据结构
    if (!Array.isArray(data.notes) || !Array.isArray(data.readLists) || !Array.isArray(data.readSchemes)) {
      throw new Error('导入的数据格式不正确');
    }

    // 验证快捷短语格式
    if (!Array.isArray(data.quickPhrases) || !data.quickPhrases.every(p => 
      typeof p === 'object' && 
      typeof p.text === 'string' && 
      typeof p.isPinned === 'boolean'
    )) {
      throw new Error('快捷短语数据格式不正确');
    }

    return data;
  } catch (error) {
    console.error('导入数据时出错:', error);
    throw new Error('导入数据失败');
  }
}; 