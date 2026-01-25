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

    const { error } = await supabase.from('labels').insert({
      user_id: user.id,
      name,
      color,
    });

    if (error) {
      console.error('Error adding label:', error);
    }
  };

  const deleteLabel = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting label:', error);
    }
  };

  return {
    labels,
    loading,
    addLabel,
    deleteLabel,
  };
}
