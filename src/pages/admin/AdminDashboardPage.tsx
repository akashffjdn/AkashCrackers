import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Package,
  Users,
  Layers,
  TrendingUp,
  Plus,
  Receipt,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/utils.ts';
import { useAuthStore } from '@/store/auth.ts';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { AdminCard } from '@/components/admin/AdminCard.tsx';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import type { AdminOrder } from '@/types/admin.ts';

export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersToday: 0,
    totalCustomers: 0,
    lowStockCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { getAllOrders, getDashboardStats } = await import('@/services/admin.ts');
        const [ordersResult, dashStats] = await Promise.all([
          getAllOrders({ limit: 10 }),
          getDashboardStats(),
        ]);
        setRecentOrders(ordersResult.data);
        setStats(dashStats);
      } catch {
        // Service not yet fully built — show empty state
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const totalOrders = recentOrders.length;
  const avgOrderValue = totalOrders > 0
    ? recentOrders.reduce((sum, o) => sum + (o.total || 0), 0) / totalOrders
    : 0;

  // Order status breakdown for chart
  const statusCounts: Record<string, number> = {};
  recentOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const statusChartColors: Record<string, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    processing: '#06B6D4',
    shipped: '#8B5CF6',
    delivered: '#22C55E',
    cancelled: '#EF4444',
  };

  const donutData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: statusChartColors[status] ?? '#9CA3AF',
  }));

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const quickActions = [
    { label: 'Add Product', href: '/admin/products/new', icon: Plus, color: 'text-brand-600 bg-brand-500/10' },
    { label: 'View Orders', href: '/admin/orders', icon: Package, color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Categories', href: '/admin/categories', icon: Layers, color: 'text-purple-600 bg-purple-500/10' },
    { label: 'New Bill', href: '/admin/billing', icon: Receipt, color: 'text-amber-600 bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">
            {greeting}, {user?.displayName?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-body-sm text-surface-500 mt-0.5">{today}</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20 self-start"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={formatPrice(stats.totalRevenue)} icon={IndianRupee} color="text-green-600 bg-green-500/10" href="/admin/analytics" isLoading={isLoading} />
        <KPICard label="Orders Today" value={String(stats.ordersToday)} icon={Package} color="text-blue-600 bg-blue-500/10" href="/admin/orders" isLoading={isLoading} />
        <KPICard label="Total Customers" value={String(stats.totalCustomers)} icon={Users} color="text-purple-600 bg-purple-500/10" href="/admin/users" isLoading={isLoading} />
        <KPICard label="Avg Order Value" value={formatPrice(Math.round(avgOrderValue))} icon={TrendingUp} color="text-cyan-600 bg-cyan-500/10" href="/admin/analytics" isLoading={isLoading} />
      </div>

      {/* Two Column: Status Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown — Donut Chart */}
        <AdminCard title="Order Status Breakdown">
          {isLoading ? (
            <div className="flex items-center justify-center h-56">
              <div className="w-36 h-36 rounded-full border-[18px] border-surface-100 dark:border-surface-800 animate-pulse" />
            </div>
          ) : totalOrders === 0 ? (
            <p className="text-body-sm text-surface-400 py-4 text-center">No orders yet</p>
          ) : (
            <div>
              <div className="h-72 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      label={({ name, value, cx, cy, midAngle, outerRadius: or }) => {
                        const RADIAN = Math.PI / 180;
                        const angle = midAngle ?? 0;
                        const radius = (or as number) + 20;
                        const x = (cx as number) + radius * Math.cos(-angle * RADIAN);
                        const y = (cy as number) + radius * Math.sin(-angle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            textAnchor={x > (cx as number) ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="fill-surface-600 dark:fill-surface-400"
                            fontSize={12}
                          >
                            {name}: {value}
                          </text>
                        );
                      }}
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-display-sm font-bold text-surface-900 dark:text-surface-50 tabular-nums">{totalOrders}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-400">Total Orders</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminCard>

        {/* Quick Actions */}
        <AdminCard title="Quick Actions" className="flex flex-col" bodyClassName="flex-1">
          <div className="grid grid-cols-2 gap-3 h-full">
            {quickActions.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                to={href}
                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-brand-500/30 hover:bg-brand-500/5 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-body-sm font-medium text-surface-600 dark:text-surface-400 group-hover:text-brand-600 transition-colors text-center">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Latest Orders — Inline Scrollable */}
      <AdminCard
        title="Latest Orders"
        titleAction={
          <Link to="/admin/orders" className="text-caption font-medium text-brand-600 hover:text-brand-700 transition-colors">
            View All
          </Link>
        }
        noPadding
      >
        {isLoading ? (
          <div className="flex gap-4 p-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[220px] h-28 rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
              <Package size={24} className="text-surface-400" />
            </div>
            <p className="text-body-sm text-surface-500">No orders yet</p>
          </div>
        ) : (
          <div className="flex gap-4 px-5 py-4 overflow-x-auto scrollbar-thin">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="min-w-[220px] flex-shrink-0 p-4 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-brand-500/30 hover:bg-brand-500/5 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm font-semibold text-surface-900 dark:text-surface-100">
                    #{order.id.slice(0, 8)}
                  </span>
                  <StatusBadge status={order.status} type="order" />
                </div>
                <p className="text-caption text-surface-500 truncate">{order.customerName || 'Unknown'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-body-sm font-bold text-surface-900 dark:text-surface-50 tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                  <span className="text-[11px] text-surface-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
