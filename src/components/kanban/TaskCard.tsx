'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Label, Priority, PRIORITIES } from '@/types';
import { GripVertical, X, Pencil, Calendar, Flag } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  labels: Label[];
  isDragOverlay?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: Partial<Task>) => void;
}

const priorityColors: Record<Priority, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-emerald-400',
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(timestamp: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return timestamp < today.getTime();
}

export function TaskCard({ task, labels, isDragOverlay, onDelete, onEdit }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority | undefined>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [editLabelIds, setEditLabelIds] = useState<string[]>(task.labelIds || []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskLabels = labels.filter(l => task.labelIds?.includes(l.id));

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit?.(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate).getTime() : undefined,
        labelIds: editLabelIds.length > 0 ? editLabelIds : undefined,
      });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      resetForm();
      setIsEditing(false);
    }
  };

  const resetForm = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditLabelIds(task.labelIds || []);
  };

  const toggleLabel = (labelId: string) => {
    setEditLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  if (isEditing) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100
                     placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Task title"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100
                     placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          placeholder="Description (optional)"
          rows={2}
        />

        <div className="flex gap-2 items-center">
          <span className="text-xs text-zinc-500">Priority:</span>
          <div className="flex gap-1">
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                onClick={() => setEditPriority(editPriority === p.id ? undefined : p.id)}
                className={cn(
                  'px-2 py-0.5 text-xs rounded transition-colors',
                  editPriority === p.id
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
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100
                       focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {editDueDate && (
            <button
              onClick={() => setEditDueDate('')}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              Clear
            </button>
          )}
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
                  editLabelIds.includes(label.id)
                    ? 'ring-1 ring-offset-1 ring-offset-zinc-900'
                    : 'opacity-60 hover:opacity-100'
                )}
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  ringColor: editLabelIds.includes(label.id) ? label.color : undefined,
                }}
              >
                {label.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsEditing(false);
            }}
            className="px-3 py-1 text-xs bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'complete';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-zinc-900 border border-zinc-800 rounded-lg p-3',
        'hover:border-zinc-700 transition-colors duration-150',
        isDragging && 'opacity-50',
        isDragOverlay && 'shadow-xl rotate-1 scale-105 border-zinc-600'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-3 p-1 opacity-0 group-hover:opacity-100
                   text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical size={14} />
      </button>

      <div className="pl-5 pr-12">
        <div className="flex items-start gap-2">
          {task.priority && (
            <Flag size={12} className={cn('mt-0.5 flex-shrink-0', priorityColors[task.priority])} />
          )}
          <h3 className="text-zinc-100 text-sm leading-snug">{task.title}</h3>
        </div>
        {task.description && (
          <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{task.description}</p>
        )}

        {(taskLabels.length > 0 || task.dueDate) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {taskLabels.map(label => (
              <span
                key={label.id}
                className="px-1.5 py-0.5 text-[10px] rounded"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
            {task.dueDate && (
              <span className={cn(
                'flex items-center gap-1 text-[10px]',
                overdue ? 'text-red-400' : 'text-zinc-500'
              )}>
                <Calendar size={10} />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete?.(task.id)}
          className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
