'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, KanbanColumn, Label, Priority, PRIORITIES } from '@/types';
import { Plus } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface NewTaskData {
  title: string;
  priority?: Priority;
  dueDate?: number;
  labelIds?: string[];
}

interface ColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  labels: Label[];
  children: ReactNode;
  onAddTask: (data: NewTaskData) => void;
}

const statusColors: Record<string, string> = {
  'todo': 'bg-amber-500',
  'in-progress': 'bg-blue-500',
  'complete': 'bg-emerald-500',
};

export function Column({ column, tasks, labels, children, onAddTask }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority | undefined>();
  const [newDueDate, setNewDueDate] = useState('');
  const [newLabelIds, setNewLabelIds] = useState<string[]>([]);

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const resetForm = () => {
    setNewTitle('');
    setNewPriority(undefined);
    setNewDueDate('');
    setNewLabelIds([]);
  };

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask({
        title: newTitle.trim(),
        priority: newPriority,
        dueDate: newDueDate ? new Date(newDueDate).getTime() : undefined,
        labelIds: newLabelIds.length > 0 ? newLabelIds : undefined,
      });
      resetForm();
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      handleAdd();
    }
    if (e.key === 'Escape') {
      resetForm();
      setIsAdding(false);
    }
  };

  const toggleLabel = (labelId: string) => {
    setNewLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <div className="flex-1 min-w-[260px] max-w-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', statusColors[column.id])} />
          <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            {column.title}
          </h2>
          <span className="text-xs text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 p-2 rounded-lg transition-all duration-150 min-h-[120px]',
          isOver ? 'bg-zinc-800/30 ring-1 ring-blue-500/20' : 'bg-transparent'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>

        {isAdding && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100
                         placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Task title..."
              autoFocus
            />

            <div className="flex gap-2 items-center">
              <span className="text-xs text-zinc-500">Priority:</span>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setNewPriority(newPriority === p.id ? undefined : p.id)}
                    className={cn(
                      'px-2 py-0.5 text-xs rounded transition-colors',
                      newPriority === p.id
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-xs text-zinc-500">Due:</span>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <span className="text-xs text-zinc-500 block mb-1.5">Labels:</span>
              <div className="flex flex-wrap gap-1.5">
                {labels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full transition-all',
                      newLabelIds.includes(label.id)
                        ? 'ring-1 ring-offset-1 ring-offset-zinc-900'
                        : 'opacity-60 hover:opacity-100'
                    )}
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      '--tw-ring-color': newLabelIds.includes(label.id) ? label.color : undefined,
                    } as React.CSSProperties}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(false);
                }}
                className="px-3 py-1 text-xs bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
