import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Search, Package, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils.ts';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import { DataTable } from '@/components/admin/DataTable.tsx';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { FilterPanel, FilterButton } from '@/components/admin/FilterPanel.tsx';
import { ExportButton, exportToCSV } from '@/components/admin/ExportButton.tsx';
import type { AdminOrder } from '@/types/admin.ts';
import type { OrderStatus } from '@/types/index.ts';

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const paymentStatusOptions = [
  { label: 'All Payments', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

const dateRangeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

function getDateRangeStart(range: string): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  if (range === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return new Date(now.getTime() - days * 86400000);
}

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { getAllOrders } = await import('@/services/admin.ts');
        const result = await getAllOrders({
          status: filter === 'all' ? undefined : filter,
        });
        setOrders(result.data);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [filter]);

  // Client-side filtering
  let filteredOrders = orders;
  const rangeStart = getDateRangeStart(dateRange);
  if (rangeStart) {
    filteredOrders = filteredOrders.filter((o) => {
      const orderDate = o.createdAt ? new Date(o.createdAt) : null;
      return orderDate && orderDate >= rangeStart;
    });
  }
  if (paymentFilter !== 'all') {
    filteredOrders = filteredOrders.filter((o) => (o.paymentStatus || 'pending') === paymentFilter);
  }

  if (search) {
    filteredOrders = filteredOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase()),
    );
  }

  const totalItems = filteredOrders.length;
  const paginatedData = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  useEffect(() => { setCurrentPage(1); }, [search, filter, dateRange, paymentFilter]);

  // KPI stats
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const handleExport = () => {
    exportToCSV(
      filteredOrders.map((o) => ({
        'Order ID': o.id,
        Customer: o.customerName,
        Email: o.customerEmail,
        Items: o.items.length,
        Total: o.total,
        Status: o.status,
        Payment: o.paymentStatus || o.paymentMethod || 'N/A',
        Date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '',
      })),
      'orders',
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Orders" value={String(orders.length)} icon={Package} color="text-blue-600 bg-blue-500/10" isLoading={isLoading} />
        <KPICard label="Revenue" value={formatPrice(totalRevenue)} icon={IndianRupee} color="text-green-600 bg-green-500/10" isLoading={isLoading} />
        <KPICard label="Pending" value={String(pendingCount)} icon={Clock} color="text-amber-600 bg-amber-500/10" isLoading={isLoading} />
        <KPICard label="Delivered" value={String(deliveredCount)} icon={CheckCircle2} color="text-green-600 bg-green-500/10" isLoading={isLoading} />
      </div>

      {/* Toolbar: Search + Filter toggle + Export */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-[13px] text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all"
          />
        </div>
        <FilterButton
          activeCount={[filter, paymentFilter, dateRange].filter((v) => v !== 'all').length}
          open={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        />
        <div className="ml-auto">
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Expandable filter panel — full width */}
      <FilterPanel
        open={showFilters}
        onClearAll={() => { setFilter('all'); setPaymentFilter('all'); setDateRange('all'); }}
        filters={[
          { id: 'status', label: 'Order Status', value: filter, options: statusOptions, onChange: (v) => setFilter(v as OrderStatus | 'all') },
          { id: 'payment', label: 'Payment Status', value: paymentFilter, options: paymentStatusOptions, onChange: setPaymentFilter },
          { id: 'date', label: 'Date Range', value: dateRange, options: dateRangeOptions, onChange: setDateRange },
        ]}
      />

      {/* Table */}
      <DataTable
        columns={[
          { key: 'id', label: 'Order' },
          { key: 'customer', label: 'Customer' },
          { key: 'items', label: 'Items' },
          { key: 'total', label: 'Total' },
          { key: 'status', label: 'Status' },
          { key: 'payment', label: 'Payment' },
          { key: 'date', label: 'Date' },
          { key: 'actions', label: '', className: 'w-12' },
        ]}
        isLoading={isLoading}
        isEmpty={filteredOrders.length === 0}
        emptyIcon={<Package size={24} className="text-surface-400" />}
        emptyTitle="No orders found"
        emptyDescription={search ? 'Try adjusting your search' : 'Orders will appear here once customers start purchasing'}
        pagination={{
          currentPage,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (size) => { setItemsPerPage(size); setCurrentPage(1); },
        }}
      >
        {paginatedData.map((order) => (
          <tr
            key={order.id}
            onClick={() => navigate(`/admin/orders/${order.id}`)}
            className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors"
          >
            <td className="px-5 py-3.5 text-body-sm font-medium text-surface-900 dark:text-surface-100">
              #{order.id.slice(0, 8)}
            </td>
            <td className="px-5 py-3.5">
              <p className="text-body-sm text-surface-900 dark:text-surface-100">
                {order.customerName || 'Unknown'}
              </p>
              <p className="text-caption text-surface-400">{order.customerEmail}</p>
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400">
              {order.items.length} items
            </td>
            <td className="px-5 py-3.5 text-body-sm font-medium text-surface-900 dark:text-surface-100 tabular-nums">
              {formatPrice(order.total)}
            </td>
            <td className="px-5 py-3.5">
              <StatusBadge status={order.status} type="order" />
            </td>
            <td className="px-5 py-3.5">
              <StatusBadge status={order.paymentStatus || 'pending'} type="payment" />
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </td>
            <td className="px-5 py-3.5">
              <Link
                to={`/admin/orders/${order.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-500/10 transition-colors inline-flex"
              >
                <Eye size={16} />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
