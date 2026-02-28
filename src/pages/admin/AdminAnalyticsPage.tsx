import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Users,
  UserPlus,
  UserCheck,
  Globe,
  Eye,
  MousePointerClick,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { formatPrice } from '@/lib/utils.ts';
import { AdminCard } from '@/components/admin/AdminCard.tsx';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { SkeletonLine } from '@/components/admin/Skeleton.tsx';
import { DateRangeFilter, getDateRangeStart, getDateRangeEnd } from '@/components/admin/DateRangeFilter.tsx';
import { ExportButton, exportToCSV } from '@/components/admin/ExportButton.tsx';
import { useThemeStore } from '@/store/theme.ts';
import type { DateRange, CustomRange } from '@/components/admin/DateRangeFilter.tsx';
import type { AdminOrder } from '@/types/admin.ts';
import type { UserProfile } from '@/types/index.ts';

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getGrowth(current: number, previous: number): number | undefined {
  if (previous === 0) return current > 0 ? 100 : undefined;
  return Math.round(((current - previous) / previous) * 100);
}

export function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customRange, setCustomRange] = useState<CustomRange>({ start: '', end: '' });
  const theme = useThemeStore((s) => s.theme);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#262626' : '#E5E5E5';
  const tooltipBg = isDark ? '#171717' : '#FFFFFF';
  const tooltipBorder = isDark ? '#404040' : '#E5E5E5';
  const axisColor = '#737373';

  useEffect(() => {
    (async () => {
      try {
        const { getAllOrders, getAllCustomers } = await import('@/services/admin.ts');
        const [ordersResult, customersResult] = await Promise.all([
          getAllOrders({}),
          getAllCustomers(),
        ]);
        setOrders(ordersResult.data);
        setCustomers(customersResult.data);
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const cutoff = getDateRangeStart(dateRange, customRange);
    const endDate = getDateRangeEnd(dateRange, customRange);
    if (!cutoff && !endDate) return orders;
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (cutoff && d < cutoff) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [orders, dateRange, customRange]);

  // Previous period orders (for growth comparison)
  const previousPeriodOrders = useMemo(() => {
    if (dateRange === 'all') return [];
    let days: number;
    if (dateRange === 'custom' && customRange.start && customRange.end) {
      const start = new Date(customRange.start + 'T00:00:00');
      const end = new Date(customRange.end + 'T23:59:59');
      days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - days * 24 * 60 * 60 * 1000);
      return orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= prevStart && d <= prevEnd;
      });
    }
    const dayMap: Record<string, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90 };
    days = dayMap[dateRange] || 30;
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= prevStart && d < periodStart;
    });
  }, [orders, dateRange, customRange]);

  // KPI values
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const deliveredOrders = filteredOrders.filter((o) => o.status === 'delivered').length;

  // Previous period KPIs
  const prevRevenue = previousPeriodOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const prevOrders = previousPeriodOrders.length;
  const prevAvg = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const prevDelivered = previousPeriodOrders.filter((o) => o.status === 'delivered').length;

  // Customer Insights
  const customerInsights = useMemo(() => {
    const cutoff = getDateRangeStart(dateRange, customRange);
    const uniqueBuyers = new Set<string>();
    const repeatBuyers = new Set<string>();
    const buyerOrderCounts: Record<string, number> = {};

    filteredOrders.forEach((o) => {
      if (!o.userId) return;
      buyerOrderCounts[o.userId] = (buyerOrderCounts[o.userId] || 0) + 1;
      uniqueBuyers.add(o.userId);
    });

    // A returning customer has more than 1 order in the period
    Object.entries(buyerOrderCounts).forEach(([uid, count]) => {
      if (count > 1) repeatBuyers.add(uid);
    });

    const newCustomers = cutoff
      ? customers.filter((c) => c.createdAt && new Date(c.createdAt) >= cutoff).length
      : customers.length;

    return {
      totalCustomers: customers.length,
      uniqueBuyers: uniqueBuyers.size,
      newCustomers,
      returningBuyers: repeatBuyers.size,
    };
  }, [filteredOrders, customers, dateRange, customRange]);

  // Revenue & Orders over time (line chart data)
  const timeSeriesData = useMemo(() => {
    const dayMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    filteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toISOString().split('T')[0];
      if (!dayMap[key]) dayMap[key] = { date: key, revenue: 0, orders: 0 };
      dayMap[key].orders += 1;
      if (o.status !== 'cancelled') dayMap[key].revenue += o.total;
    });
    return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, count: 0, revenue: 0 };
        }
        productSales[item.productId].count += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders]);

  // Customer growth over time (area chart) — filtered by date range
  const customerGrowthData = useMemo(() => {
    const cutoff = getDateRangeStart(dateRange, customRange);
    const endDate = getDateRangeEnd(dateRange, customRange);

    // Count customers before cutoff as the baseline
    let baseline = 0;
    const monthMap: Record<string, number> = {};

    customers.forEach((c) => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      if (cutoff && d < cutoff) {
        baseline += 1;
        return;
      }
      if (endDate && d > endDate) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });

    const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = baseline;
    return sorted.map(([month, count]) => {
      cumulative += count;
      return { month, newUsers: count, totalUsers: cumulative };
    });
  }, [customers, dateRange, customRange]);

  // Placeholder traffic data (simulated)
  const trafficData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split('T')[0],
        pageViews: Math.floor(Math.random() * 500 + 200),
        visitors: Math.floor(Math.random() * 200 + 80),
      };
    });
  }, []);

  const handleExport = () => {
    exportToCSV(
      filteredOrders.map((o) => ({
        orderId: o.id,
        date: new Date(o.createdAt).toLocaleDateString('en-IN'),
        status: o.status,
        items: o.items.length,
        subtotal: o.subtotal,
        shipping: o.shipping,
        total: o.total,
        paymentMethod: o.paymentMethod,
        customer: o.userId,
      })),
      'analytics-orders',
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
        <div className="flex-1" />
        <ExportButton onExport={handleExport} label="Export Orders" />
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={IndianRupee}
          color="text-green-600 bg-green-500/10"
          isLoading={isLoading}
          change={dateRange !== 'all' ? getGrowth(totalRevenue, prevRevenue) : undefined}
        />
        <KPICard
          label="Total Orders"
          value={String(totalOrders)}
          icon={Package}
          color="text-blue-600 bg-blue-500/10"
          isLoading={isLoading}
          change={dateRange !== 'all' ? getGrowth(totalOrders, prevOrders) : undefined}
        />
        <KPICard
          label="Avg Order Value"
          value={formatPrice(Math.round(avgOrderValue))}
          icon={TrendingUp}
          color="text-purple-600 bg-purple-500/10"
          isLoading={isLoading}
          change={dateRange !== 'all' ? getGrowth(avgOrderValue, prevAvg) : undefined}
        />
        <KPICard
          label="Delivered"
          value={String(deliveredOrders)}
          icon={ShoppingBag}
          color="text-amber-600 bg-amber-500/10"
          isLoading={isLoading}
          change={dateRange !== 'all' ? getGrowth(deliveredOrders, prevDelivered) : undefined}
        />
      </div>

      {/* Revenue & Orders Over Time — Line Chart */}
      <AdminCard title="Revenue & Orders Over Time">
        {isLoading ? (
          <div className="h-72 flex items-center justify-center">
            <SkeletonLine className="h-full w-full rounded-xl" />
          </div>
        ) : timeSeriesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
              <BarChart3 size={24} className="text-surface-400" />
            </div>
            <p className="text-body-sm text-surface-500">No data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDateShort(new Date(v))}
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 13,
                }}
                labelFormatter={(v) => formatDateShort(new Date(v))}
                formatter={((value: number | undefined, name: string) =>
                  name === 'revenue' ? [formatPrice(value ?? 0), 'Revenue'] : [value ?? 0, 'Orders']
                ) as never}
              />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#FF6B35" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
        {!isLoading && timeSeriesData.length > 0 && (
          <div className="flex items-center gap-6 mt-3 px-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#D4AF37] rounded-full" />
              <span className="text-caption text-surface-500">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#FF6B35] rounded-full border-dashed" style={{ borderTop: '2px dashed #FF6B35', height: 0 }} />
              <span className="text-caption text-surface-500">Orders</span>
            </div>
          </div>
        )}
      </AdminCard>

      {/* Customer Insights & Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Insights */}
        <AdminCard title="Customer Insights">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonLine className="h-8 w-8 rounded-xl" />
                  <div className="flex-1 space-y-1">
                    <SkeletonLine className="h-4 w-20" />
                    <SkeletonLine className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {([
                { label: 'Total Customers', value: customerInsights.totalCustomers, icon: Users, color: 'text-blue-600 bg-blue-500/10' },
                { label: 'Unique Buyers', value: customerInsights.uniqueBuyers, icon: UserCheck, color: 'text-green-600 bg-green-500/10' },
                { label: 'New Customers', value: customerInsights.newCustomers, icon: UserPlus, color: 'text-purple-600 bg-purple-500/10' },
                { label: 'Returning Buyers', value: customerInsights.returningBuyers, icon: Users, color: 'text-amber-600 bg-amber-500/10' },
              ] as const).map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-body-lg text-surface-900 dark:text-surface-50">{item.value}</p>
                      <p className="text-caption text-surface-500 truncate">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminCard>

        {/* Customer Growth Over Time */}
        <AdminCard title="Customer Growth">
          {isLoading ? (
            <div className="h-[230px] flex items-center justify-center">
              <SkeletonLine className="h-full w-full rounded-xl" />
            </div>
          ) : customerGrowthData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <Users size={24} className="text-surface-400" />
              </div>
              <p className="text-body-sm text-surface-500">No customer data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={customerGrowthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalUsers"
                  stroke="#D4AF37"
                  fill="#D4AF37"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Total Users"
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </AdminCard>
      </div>

      {/* Top Products by Revenue */}
      <AdminCard
        title="Top Products by Revenue"
        titleAction={
          <Link
            to="/admin/analytics/products"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        }
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <SkeletonLine className="h-full w-full rounded-xl" />
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
              <ShoppingBag size={24} className="text-surface-400" />
            </div>
            <p className="text-body-sm text-surface-500">No sales data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(250, topProducts.length * 38)}>
            <BarChart
              data={topProducts.map((p) => ({ ...p, shortName: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name }))}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 13,
                }}
                formatter={((value: number | undefined, _name: string, props: { payload: { count: number } }) => [
                  `${formatPrice(value ?? 0)} (${props.payload.count} sold)`,
                  'Revenue',
                ]) as never}
                labelFormatter={(label) => String(label)}
              />
              <Bar
                dataKey="revenue"
                fill="#D4AF37"
                fillOpacity={0.8}
                radius={[0, 6, 6, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AdminCard>

      {/* Website Traffic (Placeholder) */}
      <AdminCard
        title="Website Traffic"
        titleAction={
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-caption font-medium text-amber-600 dark:text-amber-400">
            Preview
          </span>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {([
              { label: 'Page Views', value: trafficData.reduce((s, d) => s + d.pageViews, 0), icon: Eye, color: 'text-blue-600 bg-blue-500/10' },
              { label: 'Unique Visitors', value: trafficData.reduce((s, d) => s + d.visitors, 0), icon: Globe, color: 'text-green-600 bg-green-500/10' },
              { label: 'Avg. Session', value: '2m 34s', icon: MousePointerClick, color: 'text-purple-600 bg-purple-500/10' },
            ] as const).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-body-md text-surface-900 dark:text-surface-50">{typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}</p>
                    <p className="text-caption text-surface-500 truncate">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDateShort(new Date(v))}
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 13,
                }}
                labelFormatter={(v) => formatDateShort(new Date(v))}
              />
              <Area type="monotone" dataKey="pageViews" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.08} strokeWidth={2} name="Page Views" />
              <Area type="monotone" dataKey="visitors" stroke="#22C55E" fill="#22C55E" fillOpacity={0.08} strokeWidth={2} name="Visitors" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-caption text-surface-400 text-center italic">
            Connect Google Analytics to see real traffic data. This is placeholder data.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}
