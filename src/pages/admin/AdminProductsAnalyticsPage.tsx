import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatPrice } from '@/lib/utils.ts';
import { AdminCard } from '@/components/admin/AdminCard.tsx';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { SkeletonLine } from '@/components/admin/Skeleton.tsx';
import { ExportButton, exportToCSV } from '@/components/admin/ExportButton.tsx';
import { useThemeStore } from '@/store/theme.ts';
import type { AdminOrder } from '@/types/admin.ts';

export function AdminProductsAnalyticsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const theme = useThemeStore((s) => s.theme);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#262626' : '#E5E5E5';
  const tooltipBg = isDark ? '#171717' : '#FFFFFF';
  const tooltipBorder = isDark ? '#404040' : '#E5E5E5';
  const axisColor = '#737373';

  useEffect(() => {
    (async () => {
      try {
        const { getAllOrders } = await import('@/services/admin.ts');
        const result = await getAllOrders({});
        setOrders(result.data);
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // All products by revenue (no limit)
  const allProducts = useMemo(() => {
    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      o.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, count: 0, revenue: 0 };
        }
        productSales[item.productId].count += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return allProducts;
    return allProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allProducts, search]);

  // KPI stats
  const totalRevenue = allProducts.reduce((sum, p) => sum + p.revenue, 0);
  const totalUnitsSold = allProducts.reduce((sum, p) => sum + p.count, 0);
  const avgRevenuePerProduct = allProducts.length > 0 ? totalRevenue / allProducts.length : 0;

  const handleExport = () => {
    exportToCSV(
      filtered.map((p, i) => ({
        Rank: i + 1,
        Product: p.name,
        'Units Sold': p.count,
        Revenue: p.revenue,
      })),
      'products-by-revenue',
    );
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/admin/analytics"
        className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Analytics
      </Link>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total Products"
          value={String(allProducts.length)}
          icon={ShoppingBag}
          color="text-blue-600 bg-blue-500/10"
          isLoading={isLoading}
        />
        <KPICard
          label="Total Units Sold"
          value={totalUnitsSold.toLocaleString('en-IN')}
          icon={ShoppingBag}
          color="text-green-600 bg-green-500/10"
          isLoading={isLoading}
        />
        <KPICard
          label="Avg Revenue / Product"
          value={formatPrice(Math.round(avgRevenuePerProduct))}
          icon={ShoppingBag}
          color="text-purple-600 bg-purple-500/10"
          isLoading={isLoading}
        />
      </div>

      {/* Toolbar: Search + Export */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-[13px] text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all"
          />
        </div>
        <div className="ml-auto">
          <ExportButton onExport={handleExport} label="Export CSV" />
        </div>
      </div>

      {/* Full Chart */}
      <AdminCard
        title={`All Products by Revenue (${filtered.length})`}
      >
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <SkeletonLine className="h-full w-full rounded-xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
              <ShoppingBag size={24} className="text-surface-400" />
            </div>
            <p className="text-body-sm text-surface-500">
              {search ? 'No products match your search' : 'No sales data yet'}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(400, filtered.length * 36)}>
            <BarChart
              data={filtered.map((p, i) => ({
                ...p,
                shortName: `${i + 1}. ${p.name.length > 25 ? p.name.slice(0, 25) + '…' : p.name}`,
              }))}
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
                width={200}
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
    </div>
  );
}
