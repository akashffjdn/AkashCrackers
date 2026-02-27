import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/organisms/AdminSidebar.tsx';
import { AdminTopBar } from '@/components/organisms/AdminTopBar.tsx';
import { useAdminStore } from '@/store/admin.ts';

export function AdminLayout() {
  const mobileSidebarOpen = useAdminStore((s) => s.mobileSidebarOpen);

  return (
    <div className="h-screen bg-surface-50 dark:bg-surface-950 flex overflow-hidden">
      {/* Desktop sidebar — always rendered, width controlled internally */}
      <AdminSidebar />

      {/* Mobile sidebar (overlay) — only when explicitly opened */}
      {mobileSidebarOpen && <AdminSidebar mobile />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
