'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState, useMemo } from 'react';
import { Task, TaskStatus, COLUMNS, Label, DEFAULT_LABELS, Priority, FilterState, PRIORITIES } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateId, cn } from '@/lib/utils';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { Search, Filter, X, AlertCircle } from 'lucide-react';

const DEFAULT_FILTER: FilterState = {
  priorities: [],
  labelIds: [],
  search: '',
  showOverdue: false,
};

function isOverdue(timestamp: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return timestamp < today.getTime();
}

export function Board() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('pm-tasks', []);
  const [labels] = useLocalStorage<Label[]>('pm-labels', DEFAULT_LABELS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [showFilter, setShowFilter] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const hasActiveFilters = filter.priorities.length > 0 ||
    filter.labelIds.length > 0 ||
    filter.search.trim() !== '' ||
    filter.showOverdue;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter.search.trim()) {
        const searchLower = filter.search.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (filter.priorities.length > 0) {
        if (!task.priority || !filter.priorities.includes(task.priority)) {
          return false;
        }
      }

      if (filter.labelIds.length > 0) {
        if (!task.labelIds || !filter.labelIds.some(id => task.labelIds?.includes(id))) {
          return false;
        }
      }

      if (filter.showOverdue) {
        if (!task.dueDate || !isOverdue(task.dueDate) || task.status === 'complete') {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filter]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'complete': [],
    };
    [...filteredTasks]
      .sort((a, b) => a.order - b.order)
      .forEach(task => grouped[task.status].push(task));
    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = COLUMNS.some(col => col.id === overId);

    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        setTasks(prev => prev.map(task =>
          task.id === activeId
            ? { ...task, status: newStatus }
            : task
        ));
      }
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && activeTask.status !== overTask.status) {
        setTasks(prev => prev.map(task =>
          task.id === activeId
            ? { ...task, status: overTask.status }
            : task
        ));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isOverColumn = COLUMNS.some(col => col.id === overId);
    if (isOverColumn) return;

    setTasks(prev => {
      const activeIndex = prev.findIndex(t => t.id === activeId);
      const overIndex = prev.findIndex(t => t.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reordered = arrayMove(prev, activeIndex, overIndex);
        return reordered.map((task, idx) => ({ ...task, order: idx }));
      }
      return prev;
    });
  };

  const addTask = (status: TaskStatus) => (data: {
    title: string;
    priority?: Priority;
    dueDate?: number;
    labelIds?: string[];
  }) => {
    const newTask: Task = {
      id: generateId(),
      title: data.title,
      status,
      priority: data.priority,
      dueDate: data.dueDate,
      labelIds: data.labelIds,
      createdAt: Date.now(),
      order: tasks.length,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const editTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const togglePriorityFilter = (priority: Priority) => {
    setFilter(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const toggleLabelFilter = (labelId: string) => {
    setFilter(prev => ({
      ...prev,
      labelIds: prev.labelIds.includes(labelId)
        ? prev.labelIds.filter(id => id !== labelId)
        : [...prev.labelIds, labelId],
    }));
  };

  const clearFilters = () => {
    setFilter(DEFAULT_FILTER);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-800/50">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search tasks..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-9 pr-3 py-1.5 text-sm
                       text-zinc-100 placeholder-zinc-600
                       focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowFilter(!showFilter)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors',
            showFilter || hasActiveFilters
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Filter size={14} />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
              {filter.priorities.length + filter.labelIds.length + (filter.showOverdue ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {showFilter && (
        <div className="px-6 py-3 border-b border-zinc-800/50 bg-zinc-900/50 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-16">Priority:</span>
            <div className="flex gap-1.5">
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePriorityFilter(p.id)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-md transition-colors',
                    filter.priorities.includes(p.id)
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-16">Labels:</span>
            <div className="flex flex-wrap gap-1.5">
              {labels.map(label => (
                <button
                  key={label.id}
                  onClick={() => toggleLabelFilter(label.id)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full transition-all',
                    filter.labelIds.includes(label.id)
                      ? 'ring-1 ring-offset-1 ring-offset-zinc-900'
                      : 'opacity-60 hover:opacity-100'
                  )}
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    ringColor: filter.labelIds.includes(label.id) ? label.color : undefined,
                  }}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-16">Status:</span>
            <button
              onClick={() => setFilter(prev => ({ ...prev, showOverdue: !prev.showOverdue }))}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors',
                filter.showOverdue
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
              )}
            >
              <AlertCircle size={12} />
              Overdue only
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-6 flex-1 overflow-x-auto">
          {COLUMNS.map(column => (
            <Column
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id]}
              labels={labels}
              onAddTask={addTask(column.id)}
            >
              {tasksByColumn[column.id].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  labels={labels}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
              ))}
            </Column>
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} labels={labels} isDragOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
