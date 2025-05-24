import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar';
import { ServerSidebar } from '@/components/server-sidebar';
import { useAuth } from '@/hooks/use-auth';

export function MainLayout() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar user={user} onLogout={logout} />

      <ServerSidebar />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
