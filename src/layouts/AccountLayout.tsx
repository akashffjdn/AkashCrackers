import { NavLink, Outlet } from 'react-router-dom';
import { User, Package, MapPin, Shield, Heart, Bell, LogOut } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { signOutUser } from '@/services/auth.ts';
import { cn } from '@/lib/utils.ts';

const sidebarItems = [
  { icon: User, label: 'Dashboard', href: '/account', end: true },
  { icon: User, label: 'Profile', href: '/account/profile', end: false },
  { icon: Package, label: 'Orders', href: '/account/orders', end: false },
  { icon: MapPin, label: 'Addresses', href: '/account/addresses', end: false },
  { icon: Shield, label: 'Security', href: '/account/security', end: false },
  { icon: Heart, label: 'Wishlist', href: '/account/wishlist', end: false },
  { icon: Bell, label: 'Notifications', href: '/account/notifications', end: false },
];

export function AccountLayout() {
  const logout = useAuthStore((s) => s.logout);

  const handleSignOut = async () => {
    await signOutUser();
    logout();
  };

  return (
    <div className="pt-16 lg:pt-18 min-h-screen bg-surface-50 dark:bg-surface-950">
      <Container size="wide">
        <div className="py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar (desktop) / Tabs (mobile) */}
            <aside className="lg:w-64 flex-shrink-0">
              {/* Mobile: horizontal scroll tabs */}
              <nav className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {sidebarItems.map(({ icon: Icon, label, href, end }) => (
                  <NavLink
                    key={href}
                    to={href}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm font-medium whitespace-nowrap border transition-colors',
                        isActive
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20'
                          : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700',
                      )
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </nav>

              {/* Desktop sidebar */}
              <div className="hidden lg:block bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-3">
                <nav className="space-y-1">
                  {sidebarItems.map(({ icon: Icon, label, href, end }) => (
                    <NavLink
                      key={href}
                      to={href}
                      end={end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-4 py-2.5 rounded-xl text-body-sm font-medium transition-colors',
                          isActive
                            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850',
                        )
                      }
                    >
                      <Icon size={18} />
                      {label}
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-body-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </Container>
    </div>
  );
}
