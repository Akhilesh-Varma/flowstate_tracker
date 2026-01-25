'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface NoteRow {
  id: string;
  user_id: string;
  content: string;
  updated_at: string;
}

export function useNote() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const fetchNote = useCallback(async () => {
    if (!user) {
      setContent('');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Note doesn't exist yet, create one
      if (error.code === 'PGRST116') {
        const { data: newNote, error: insertError } = await supabase
          .from('notes')
          .insert({
            user_id: user.id,
            content: '',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating note:', insertError);
        } else if (newNote) {
          setContent((newNote as NoteRow).content);
        }
      } else {
        console.error('Error fetching note:', error);
      }
    } else if (data) {
      setContent((data as NoteRow).content);
    }

    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && 'content' in payload.new) {
            setContent((payload.new as NoteRow).content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);

      // Debounce save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        if (!user) return;

        const { error } = await supabase
          .from('notes')
          .update({
            content: newContent,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error saving note:', error);
        }
      }, 500);
    },
    [user, supabase]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    content,
    loading,
    updateContent,
  };
}
