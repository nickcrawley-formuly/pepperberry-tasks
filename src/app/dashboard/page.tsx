import { getSession } from '@/lib/auth';
import { fetchTasks } from '@/lib/tasks';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import TaskList from '@/components/tasks/TaskList';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const tasks = await fetchTasks(session);

  const greeting =
    session.role === 'admin'
      ? `${tasks.filter((t) => t.status !== 'done').length} open tasks`
      : `${tasks.filter((t) => t.status !== 'done').length} tasks for you`;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-stone-800">
              Pepperberry
            </h1>
            <p className="text-xs text-stone-400">Task Board</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-stone-700">
                {session.name}
              </p>
              <p className="text-xs text-stone-400 capitalize">
                {session.role.replace('_', ' ')}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        <div className="mb-5">
          <p className="text-sm text-stone-500">{greeting}</p>
        </div>

        <TaskList tasks={tasks} />
      </main>
    </div>
  );
}
