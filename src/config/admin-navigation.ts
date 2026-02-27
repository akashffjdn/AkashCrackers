export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  group: 'main' | 'commerce' | 'people' | 'insights' | 'manage';
  end?: boolean;
  badge?: 'pending-orders' | 'low-stock';
}

export const adminNavGroups: Record<string, string> = {
  main: 'Main',
  commerce: 'Commerce',
  people: 'People',
  insights: 'Insights',
  manage: 'Manage',
};

export const adminNavItems: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', group: 'main', end: true },
  { id: 'billing', label: 'Billing', href: '/admin/billing', icon: 'Receipt', group: 'commerce', end: true },
  { id: 'bills', label: 'Bills', href: '/admin/bills', icon: 'FileText', group: 'commerce' },
  { id: 'orders', label: 'Orders', href: '/admin/orders', icon: 'Package', group: 'commerce', badge: 'pending-orders' },
  { id: 'products', label: 'Products', href: '/admin/products', icon: 'ShoppingBag', group: 'commerce', badge: 'low-stock' },
  { id: 'categories', label: 'Categories', href: '/admin/categories', icon: 'Layers', group: 'commerce' },
  { id: 'users', label: 'Users', href: '/admin/users', icon: 'Users', group: 'people' },
  { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3', group: 'insights' },
  { id: 'content', label: 'Content', href: '/admin/content', icon: 'FileImage', group: 'manage' },
  { id: 'settings', label: 'Settings', href: '/admin/settings', icon: 'Settings', group: 'manage' },
];
