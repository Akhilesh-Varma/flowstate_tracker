'use client';

import { useState, useEffect, useCallback } from 'react';
import { Label, DEFAULT_LABELS } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface LabelRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

function rowToLabel(row: LabelRow): Label {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchLabels = useCallback(async () => {
    if (!user) {
      setLabels([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching labels:', error);
      setLoading(false);
      return;
    }

    // If user has no labels, seed with defaults
    if (data.length === 0) {
      const inserts = DEFAULT_LABELS.map((label) => ({
        user_id: user.id,
        name: label.name,
        color: label.color,
      }));

      const { data: newLabels, error: insertError } = await supabase
        .from('labels')
        .insert(inserts)
        .select();

      if (insertError) {
        console.error('Error seeding default labels:', insertError);
      } else {
        setLabels((newLabels as LabelRow[]).map(rowToLabel));
      }
    } else {
      setLabels((data as LabelRow[]).map(rowToLabel));
    }

    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('labels-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'labels',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchLabels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchLabels]);

  const addLabel = async (name: string, color: string) => {
    if (!user) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticLabel: Label = {
      id: tempId,
      name,
      color,
    };
    setLabels((prev) => [...prev, optimisticLabel]);

    const { data: newLabel, error } = await supabase
      .from('labels')
      .insert({
        user_id: user.id,
        name,
        color,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding label:', error);
      // Revert optimistic update on error
      setLabels((prev) => prev.filter((l) => l.id !== tempId));
    } else if (newLabel) {
      // Replace temp label with real one
      setLabels((prev) =>
        prev.map((l) => (l.id === tempId ? rowToLabel(newLabel as LabelRow) : l))
      );
    }
  };

  const deleteLabel = async (id: string) => {
    if (!user) return;

    // Store previous state for rollback
    const previousLabels = labels;

    // Optimistic update
    setLabels((prev) => prev.filter((l) => l.id !== id));

    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting label:', error);
      // Revert on error
      setLabels(previousLabels);
    }
  };

  return {
    labels,
    loading,
    addLabel,
    deleteLabel,
  };
}
