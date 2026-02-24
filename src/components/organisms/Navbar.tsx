import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Search, ChevronDown, User, LogOut, Package, Heart } from 'lucide-react';
import { ThemeToggle } from '@/components/atoms/ThemeToggle.tsx';
import { Container } from '@/components/atoms/Container.tsx';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { UserDropdown } from '@/components/molecules/UserDropdown.tsx';
import { useScrollDirection } from '@/hooks/useScrollDirection.ts';
import { useCartStore } from '@/store/cart.ts';
import { useAuthStore } from '@/store/auth.ts';
import { signOutUser } from '@/services/auth.ts';
import { mainNavLinks } from '@/config/navigation.ts';
import { siteConfig } from '@/config/site.ts';
import { cn } from '@/lib/utils.ts';
import logoImg from '@/assets/images/logo_crackers.png';

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { isAtTop } = useScrollDirection();
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleSignOut = async () => {
    await signOutUser();
    logout();
    setIsMobileOpen(false);
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && isAtTop;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isTransparent
            ? 'bg-transparent'
            : 'glass-nav shadow-sm',
        )}
      >
        <Container size="full">
          <nav className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 z-10"
              onClick={() => setIsMobileOpen(false)}
            >
              <img src={logoImg} alt={siteConfig.name} className="w-8 h-8 rounded-lg object-contain" />
              <span
                className={cn(
                  'font-display font-bold text-heading-sm transition-colors',
                  isTransparent
                    ? 'text-white'
                    : 'text-surface-900 dark:text-surface-50',
                )}
              >
                {siteConfig.name}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {mainNavLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-xl text-body-sm font-medium transition-colors',
                      isTransparent
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800',
                    )}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={14} className="opacity-50" />}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-56 rounded-2xl p-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-lg"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block px-4 py-2.5 rounded-xl text-body-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <Link
                to="/shop"
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                  isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                )}
                aria-label="Search products"
              >
                <Search size={20} />
              </Link>

              <ThemeToggle
                className={cn(
                  isTransparent && 'text-white/80 hover:text-white hover:bg-white/10',
                )}
              />

              {/* User / Auth */}
              {isAuthenticated && user ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-xl transition-colors overflow-hidden',
                      isTransparent
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                    )}
                    aria-label="Account menu"
                  >
                    <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                  </button>
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <UserDropdown isOpen={isUserDropdownOpen} onClose={() => setIsUserDropdownOpen(false)} />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={cn(
                    'hidden lg:flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                    isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                  )}
                  aria-label="Sign in"
                >
                  <User size={20} />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                  isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                )}
                aria-label="Open cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-surface-950 text-caption font-bold"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={cn(
                  'lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-colors ml-1',
                  isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                )}
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white dark:bg-surface-900 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="space-y-1">
                  {mainNavLinks.map((link) => (
                    <div key={link.label}>
                      <Link
                        to={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="block px-4 py-3 rounded-xl text-body-lg font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      >
                        {link.label}
                      </Link>
                      {link.children && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-surface-200 dark:border-surface-800 pl-4">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              onClick={() => setIsMobileOpen(false)}
                              className="block px-3 py-2 rounded-lg text-body-sm text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Auth Section */}
                <div className="mt-8 pt-8 border-t border-surface-200 dark:border-surface-800">
                  {isAuthenticated && user ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <Avatar src={user.photoURL} name={user.displayName} size="md" />
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-50 truncate">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-caption text-surface-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link to="/account" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-body-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        <User size={18} className="text-surface-400" /> My Account
                      </Link>
                      <Link to="/account/orders" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-body-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        <Package size={18} className="text-surface-400" /> Orders
                      </Link>
                      <Link to="/account/wishlist" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-body-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        <Heart size={18} className="text-surface-400" /> Wishlist
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-body-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileOpen(false)}
                        className="block w-full px-4 py-3 rounded-xl text-center text-body-md font-semibold bg-brand-500 text-surface-950 hover:bg-brand-600 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileOpen(false)}
                        className="block w-full px-4 py-3 rounded-xl text-center text-body-md font-semibold border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800">
                  <p className="text-body-sm text-surface-500 dark:text-surface-400">
                    {siteConfig.contact.phone}
                  </p>
                  <p className="text-body-sm text-surface-500 dark:text-surface-400 mt-1">
                    {siteConfig.contact.email}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
