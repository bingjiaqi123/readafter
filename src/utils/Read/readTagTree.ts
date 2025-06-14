import { ReadScheme } from '../../types';

export interface TagNode {
  name: string;
  fullPath: string;
  children: Map<string, TagNode>;
  items: Set<string>; // 存储包含此标签的 item id
}

/**
 * 构建标签树
 * @param items 包含标签的条目列表
 * @returns 标签树根节点
 */
export function buildTagTree(items: ReadScheme[] = []): TagNode {
  const root: TagNode = {
    name: 'root',
    fullPath: '',
    children: new Map(),
    items: new Set()
  };

  if (!items) return root;

  items.forEach(item => {
    if (!item || !item.tags) return;
    item.tags.forEach(tag => {
      if (!tag) return;
      const parts = tag.split('-');
      let current = root;
      let currentPath = '';

      parts.forEach((part) => {
        if (!part) return;
        currentPath = currentPath ? `${currentPath}-${part}` : part;
        if (!current.children.has(part)) {
          current.children.set(part, {
            name: part,
            fullPath: currentPath,
            children: new Map(),
            items: new Set()
          });
        }
        current = current.children.get(part)!;
        current.items.add(item.id);
      });
    });
  });

  return root;
}

/**
 * 在标签树中查找节点
 * @param node 当前节点
 * @param path 要查找的路径
 * @returns 找到的节点，如果不存在则返回 null
 */
export function findTagNode(node: TagNode, path: string): TagNode | null {
  if (!node || !path) return null;
  if (node.fullPath === path) return node;
  for (const child of node.children.values()) {
    const found = findTagNode(child, path);
    if (found) return found;
  }
  return null;
}

/**
 * 获取标签节点下的所有条目
 * @param node 标签树根节点
 * @param path 标签路径
 * @param items 所有条目列表
 * @returns 标签节点下的条目列表
 */
export function getItemsByTag<T extends ReadScheme>(node: TagNode, path: string, items: T[] = []): T[] {
  if (!node || !path || !items) return items;
  const tagNode = findTagNode(node, path);
  if (!tagNode) return items;
  return items.filter(item => item && tagNode.items.has(item.id));
} 