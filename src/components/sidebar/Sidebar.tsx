'use client';

import { QuickList } from './QuickList';
import { LabelManager } from './LabelManager';
import { NoteArea } from '../notes/NoteArea';

export function Sidebar() {
  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800/50 p-4 flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-100 px-2">Vibe Board</h1>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto">
        <QuickList />
        <LabelManager />
        <NoteArea />
      </div>
    </aside>
  );
}
