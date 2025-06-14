import { Note } from '../../types/index';
import { ReadScheme } from '../../types';

/**
 * 计算每个标签下的笔记数量
 * @param items 笔记列表
 * @returns Map<string, number> 标签到笔记数量的映射
 */
export function calculateTagCounts(items: Note[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  // 计算每个标签的笔记数量
  items.forEach(item => {
    (item.tags || []).forEach(tag => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  
  return counts;
}

/**
 * 获取所有标签及其笔记数量
 * @param items 笔记列表
 * @returns Array<{tag: string, count: number}> 标签及其数量的数组
 */
export function getAllTagCounts(items: Note[]): Array<{tag: string, count: number}> {
  const counts = calculateTagCounts(items);
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * 计算每个标签下的跟读方案数量
 * @param schemes 跟读方案列表
 * @returns Map<string, number> 标签路径到方案数量的映射
 */
export function calculateSchemeTagCounts(schemes: ReadScheme[]): Map<string, number> {
  const counts = new Map<string, number>();

  // 遍历所有方案
  schemes.forEach(scheme => {
    const tags = scheme.tags || [];
    
    // 遍历方案的所有标签
    tags.forEach(tag => {
      // 更新标签计数
      const currentCount = counts.get(tag) || 0;
      counts.set(tag, currentCount + 1);
    });
  });

  return counts;
} 