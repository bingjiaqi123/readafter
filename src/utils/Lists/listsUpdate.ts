import { ReadList } from '../../types';

export function updateReadList(updatedList: ReadList): void {
  // 从本地存储中获取所有列表
  const listsJson = localStorage.getItem('read_lists');
  if (!listsJson) return;

  const lists: ReadList[] = JSON.parse(listsJson);
  
  // 找到并更新目标列表
  const updatedLists = lists.map(list => 
    list.id === updatedList.id ? updatedList : list
  );

  // 保存更新后的列表
  localStorage.setItem('read_lists', JSON.stringify(updatedLists));
} 