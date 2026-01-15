'use client';

import { useState } from 'react';
import { TodoItem } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { QuickItem } from './QuickItem';
import { Plus } from 'lucide-react';
import { generateId } from '@/lib/utils';

export function QuickList() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('pm-todos', []);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: TodoItem = {
      id: generateId(),
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [...prev, todo]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

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
          onClick={addTodo}
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
