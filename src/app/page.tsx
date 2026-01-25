import { Sidebar } from '@/components/sidebar/Sidebar';
import { Board } from '@/components/kanban/Board';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
    </div>
  );
}
