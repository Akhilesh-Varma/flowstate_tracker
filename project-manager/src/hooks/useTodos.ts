'use client';

import { useState, useEffect, useCallback } from 'react';
import { TodoItem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface TodoRow {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

function rowToTodo(row: TodoRow): TodoItem {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchTodos = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos((data as TodoRow[]).map(rowToTodo));
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchTodos]);

  const addTodo = async (text: string) => {
    if (!user) return;

    const { error } = await supabase.from('todos').insert({
      user_id: user.id,
      text,
      completed: false,
    });

    if (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    if (!user) return;

    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return {
    todos,
    loading,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
