'use client';

import { TodoItem } from '@/types';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickItemProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function QuickItem({ item, onToggle, onDelete }: QuickItemProps) {
  return (
    <div className="group flex items-center gap-2 py-1.5 px-2 rounded hover:bg-zinc-800/50 transition-colors">
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
          item.completed
            ? 'bg-blue-600 border-blue-600'
            : 'border-zinc-600 hover:border-zinc-500'
        )}
      >
        {item.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span
        className={cn(
          'flex-1 text-sm transition-colors',
          item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
        )}
      >
        {item.text}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        className="p-0.5 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
      >
        <X size={14} />
      </button>
    </div>
  );
}
