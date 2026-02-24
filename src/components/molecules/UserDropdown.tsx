import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { signOutUser } from '@/services/auth.ts';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: User, label: 'My Account', href: '/account' },
  { icon: Package, label: 'Orders', href: '/account/orders' },
  { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
  { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
  { icon: Settings, label: 'Settings', href: '/account/security' },
];

export function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSignOut = async () => {
    await signOutUser();
    logout();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden z-50"
    >
      {/* User Info */}
      <div className="p-4 border-b border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <Avatar src={user.photoURL} name={user.displayName} size="md" />
          <div className="min-w-0">
            <p className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-50 truncate">
              {user.displayName || 'User'}
            </p>
            <p className="text-caption text-surface-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {menuItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            to={href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors"
          >
            <Icon size={18} className="text-surface-400" />
            {label}
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <div className="p-2 border-t border-surface-100 dark:border-surface-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
