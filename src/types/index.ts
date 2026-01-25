export type TaskStatus = 'todo' | 'in-progress' | 'complete';

export type Priority = 'high' | 'medium' | 'low';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  dueDate?: number;
  labelIds?: string[];
  createdAt: number;
  order: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  content: string;
  updatedAt: number;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
}

export const COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'complete', title: 'Complete' },
];

export const PRIORITIES: { id: Priority; label: string; color: string }[] = [
  { id: 'high', label: 'High', color: '#ef4444' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'low', label: 'Low', color: '#22c55e' },
];

export const DEFAULT_LABELS: Label[] = [
  { id: 'bug', name: 'Bug', color: '#ef4444' },
  { id: 'feature', name: 'Feature', color: '#8b5cf6' },
  { id: 'docs', name: 'Docs', color: '#06b6d4' },
  { id: 'design', name: 'Design', color: '#ec4899' },
  { id: 'refactor', name: 'Refactor', color: '#f59e0b' },
];

export interface FilterState {
  priorities: Priority[];
  labelIds: string[];
  search: string;
  showOverdue: boolean;
}
