'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { QuickItem } from './QuickItem';
import { Plus, Loader2 } from 'lucide-react';

export function QuickList() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    await addTodo(newTodo.trim());
    setNewTodo('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2">
          Quick List
        </h2>
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2">
        Quick List
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add item..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm
                     text-zinc-100 placeholder-zinc-600
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAddTodo}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-md
                     text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-0.5">
        {todos.map(todo => (
          <QuickItem
            key={todo.id}
            item={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
        {todos.length === 0 && (
          <p className="text-sm text-zinc-600 px-2 py-3">No items yet</p>
        )}
      </div>
    </div>
  );
}
