'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const DEFAULT_NOTE: Note = {
  id: 'main-note',
  content: '',
  updatedAt: Date.now(),
};

export function NoteArea() {
  const [note, setNote] = useLocalStorage<Note>('pm-note', DEFAULT_NOTE);
  const [localContent, setLocalContent] = useState(note.content);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localContent !== note.content) {
        setNote({ ...note, content: localContent, updatedAt: Date.now() });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localContent, note, setNote]);

  useEffect(() => {
    setLocalContent(note.content);
  }, [note.content]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2 mb-3">
        Notes
      </h2>
      <textarea
        value={localContent}
        onChange={e => setLocalContent(e.target.value)}
        placeholder="Write your thoughts..."
        className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3
                   text-sm text-zinc-200 placeholder-zinc-600 resize-none leading-relaxed
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
