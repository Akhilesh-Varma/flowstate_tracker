'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, Priority } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority | null;
  due_date: string | null;
  label_ids: string[];
  created_at: string;
  order: number;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority ?? undefined,
    dueDate: row.due_date ? new Date(row.due_date).getTime() : undefined,
    labelIds: row.label_ids,
    createdAt: new Date(row.created_at).getTime(),
    order: row.order,
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks((data as TaskRow[]).map(rowToTask));
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchTasks]);

  const addTask = async (data: {
    title: string;
    status: TaskStatus;
    priority?: Priority;
    dueDate?: number;
    labelIds?: string[];
  }) => {
    if (!user) return;

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: data.title,
      status: data.status,
      priority: data.priority ?? null,
      due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      label_ids: data.labelIds ?? [],
      order: tasks.length,
    });

    if (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.dueDate !== undefined) {
      dbUpdates.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
    }
    if (updates.labelIds !== undefined) dbUpdates.label_ids = updates.labelIds;
    if (updates.order !== undefined) dbUpdates.order = updates.order;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
    }
  };

  const reorderTasks = async (reorderedTasks: Task[]) => {
    if (!user) return;

    // Optimistically update local state
    setTasks(reorderedTasks);

    // Update each task's order in the database
    const updates = reorderedTasks.map((task, index) =>
      supabase
        .from('tasks')
        .update({ order: index })
        .eq('id', task.id)
        .eq('user_id', user.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      console.error('Error reordering tasks');
      fetchTasks(); // Refresh on error
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    setTasks,
  };
}
