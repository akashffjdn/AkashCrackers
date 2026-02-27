import { useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Layers,
  BarChart3,
  FileImage,
  Settings,
  Receipt,
  FileText,
  ArrowLeft,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { adminNavItems, adminNavGroups } from '@/config/admin-navigation.ts';
import type { AdminNavItem } from '@/config/admin-navigation.ts';
import { useAdminStore } from '@/store/admin.ts';
import { useAuthStore } from '@/store/auth.ts';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { cn } from '@/lib/utils.ts';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Layers,
  BarChart3,
  FileImage,
  Settings,
  Receipt,
  FileText,
};

interface AdminSidebarProps {
  mobile?: boolean;
}

export function AdminSidebar({ mobile }: AdminSidebarProps) {
  const sidebarCollapsed = useAdminStore((s) => s.sidebarCollapsed);
  const setMobileSidebarOpen = useAdminStore((s) => s.setMobileSidebarOpen);
  const user = useAuthStore((s) => s.user);

  const collapsed = !mobile && sidebarCollapsed;
  const closeMobile = () => setMobileSidebarOpen(false);

  // Group navigation items
  const grouped = useMemo(() => {
    const groups: Record<string, AdminNavItem[]> = {};
    for (const item of adminNavItems) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {mobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col transition-all duration-200',
          mobile
            ? 'fixed inset-y-0 left-0 z-50 w-64 lg:hidden'
            : 'hidden lg:flex flex-shrink-0',
          !mobile && (collapsed ? 'w-[68px]' : 'w-64'),
        )}
      >
        {/* Header */}
        <div className={cn('h-16 flex items-center border-b border-surface-200 dark:border-surface-800', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand-500/30">
              <Sparkles size={16} className="text-white" />
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-body-md text-surface-900 dark:text-surface-50">
                Admin
              </span>
            )}
          </Link>
          {mobile && (
            <button onClick={closeMobile} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 overflow-y-auto', collapsed ? 'p-2' : 'p-3')}>
          {Object.entries(grouped).map(([groupKey, items]) => (
            <div key={groupKey} className={collapsed ? 'mb-2' : 'mb-4'}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500">
                  {adminNavGroups[groupKey]}
                </p>
              )}
              {collapsed && groupKey !== 'main' && (
                <div className="mx-2 mb-2 border-t border-surface-100 dark:border-surface-800" />
              )}
              <div className="space-y-0.5">
                {items.map(({ id, label, href, icon, end }) => {
                  const Icon = iconMap[icon] || LayoutDashboard;
                  return (
                    <NavLink
                      key={id}
                      to={href}
                      end={end}
                      onClick={mobile ? closeMobile : undefined}
                      title={collapsed ? label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-xl text-body-sm font-medium transition-colors relative',
                          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                          isActive
                            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850',
                        )
                      }
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!collapsed && label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn('border-t border-surface-200 dark:border-surface-800', collapsed ? 'p-2 space-y-1' : 'p-3 space-y-2')}>
          {user && !collapsed && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <Avatar src={user.photoURL} name={user.displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-medium text-surface-900 dark:text-surface-50 truncate">
                  {user.displayName}
                </p>
                <p className="text-caption text-surface-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const { signOutUser } = await import('@/services/auth.ts');
                    await signOutUser();
                  } catch { /* handled by auth listener */ }
                }}
                title="Logout"
                className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
          {user && collapsed && (
            <>
              <Link to="/admin/profile" className="flex justify-center p-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors" title={user.displayName}>
                <Avatar src={user.photoURL} name={user.displayName} size="sm" />
              </Link>
              <button
                onClick={async () => {
                  try {
                    const { signOutUser } = await import('@/services/auth.ts');
                    await signOutUser();
                  } catch { /* handled by auth listener */ }
                }}
                title="Logout"
                className="flex justify-center p-2.5 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-colors w-full"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
          <Link
            to="/"
            title={collapsed ? 'Back to Store' : undefined}
            className={cn(
              'flex items-center rounded-xl text-body-sm font-medium text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors',
              collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
            )}
          >
            <ArrowLeft size={16} className="flex-shrink-0" />
            {!collapsed && 'Back to Store'}
          </Link>
        </div>
      </aside>
    </>
  );
}
