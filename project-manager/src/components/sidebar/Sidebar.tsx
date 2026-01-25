'use client';

import { QuickList } from './QuickList';
import { LabelManager } from './LabelManager';
import { NoteArea } from '../notes/NoteArea';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800/50 p-4 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100 px-2">Vibe Board</h1>
        <button
          onClick={signOut}
          title={`Sign out (${user?.email})`}
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto">
        <QuickList />
        <LabelManager />
        <NoteArea />
      </div>
    </aside>
  );
}
