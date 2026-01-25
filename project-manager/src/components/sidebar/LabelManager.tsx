'use client';

import { useState } from 'react';
import { useLabels } from '@/hooks/useLabels';
import { Plus, X, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

export function LabelManager() {
  const { labels, loading, addLabel, deleteLabel } = useLabels();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const handleAddLabel = async () => {
    if (newName.trim()) {
      await addLabel(newName.trim(), newColor);
      setNewName('');
      setNewColor(PRESET_COLORS[0]);
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    }
    if (e.key === 'Escape') {
      setNewName('');
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={12} />
            Labels
          </h2>
        </div>
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <Tag size={12} />
          Labels
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Label name..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100
                       placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={cn(
                  'w-6 h-6 rounded-full transition-all',
                  newColor === color && 'ring-2 ring-offset-2 ring-offset-zinc-900'
                )}
                style={{ backgroundColor: color, '--tw-ring-color': color } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddLabel}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setNewName('');
                setIsAdding(false);
              }}
              className="px-3 py-1 text-xs bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {labels.map(label => (
          <div
            key={label.id}
            className="group flex items-center justify-between py-1.5 px-2 rounded hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              <span className="text-sm text-zinc-300">{label.name}</span>
            </div>
            <button
              onClick={() => deleteLabel(label.id)}
              className="p-0.5 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <p className="text-sm text-zinc-600 px-2 py-2">No labels yet</p>
        )}
      </div>
    </div>
  );
}
