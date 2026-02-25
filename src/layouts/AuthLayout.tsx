import { Outlet, Link } from 'react-router-dom';
import { siteConfig } from '@/config/site.ts';
import logoImg from '@/assets/images/logo_crackers_optimized.png';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 px-4 py-10">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <img src={logoImg} alt={siteConfig.name} className="w-10 h-10 rounded-xl object-contain" />
        <span className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">
          {siteConfig.name}
        </span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      {/* Footer Link */}
      <p className="mt-8 text-caption text-surface-400">
        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </div>
  );
}
