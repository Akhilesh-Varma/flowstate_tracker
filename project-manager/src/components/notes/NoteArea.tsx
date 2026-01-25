'use client';

import { useNote } from '@/hooks/useNote';
import { Loader2 } from 'lucide-react';

export function NoteArea() {
  const { content, loading, updateContent } = useNote();

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2 mb-3">
          Notes
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2 mb-3">
        Notes
      </h2>
      <textarea
        value={content}
        onChange={e => updateContent(e.target.value)}
        placeholder="Write your thoughts..."
        className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3
                   text-sm text-zinc-200 placeholder-zinc-600 resize-none leading-relaxed
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
