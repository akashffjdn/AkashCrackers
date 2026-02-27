import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Pencil, ShoppingBag, IndianRupee, Package, TrendingUp } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import { DataTable } from '@/components/admin/DataTable.tsx';
import { KPICard } from '@/components/admin/KPICard.tsx';
import { formatPrice } from '@/lib/utils.ts';
import type { UserProfile, Order } from '@/types/index.ts';

export function AdminUserDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const { getCustomerById, getCustomerOrders } = await import('@/services/admin.ts');
        const [userData, userOrders] = await Promise.all([
          getCustomerById(uid),
          getCustomerOrders(uid),
        ]);
        setUser(userData);
        setOrders(userOrders);
      } catch { /* handled */ }
      finally { setIsLoading(false); }
    })();
  }, [uid]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <div className="text-center py-20">
          <p className="text-body-md text-surface-500">User not found</p>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);
  const avgOrder = orders.length > 0 ? Math.round(totalSpent / orders.length) : 0;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Back + Edit */}
      <div className="flex items-center justify-between">
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <Link
          to={`/admin/users/${uid}/edit`}
          className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-500 text-white text-[13px] font-semibold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20"
        >
          <Pencil size={15} /> Edit User
        </Link>
      </div>

      {/* Profile Header — full width horizontal */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <Avatar src={user.photoURL} name={user.displayName} size="lg" />
            <div>
              <h2 className="font-display font-semibold text-body-lg text-surface-900 dark:text-surface-50">
                {user.displayName || 'Unnamed'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={user.role ?? 'user'} type="role" />
                <StatusBadge status={user.isActive !== false ? 'active' : 'inactive'} type="user" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-14 bg-surface-200 dark:bg-surface-700 self-center" />

          {/* Contact Details — grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 flex-1">
            <div className="flex items-center gap-2.5 text-body-sm">
              <Mail size={15} className="text-surface-400 flex-shrink-0" />
              <span className="text-surface-600 dark:text-surface-400 truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-body-sm">
              <Phone size={15} className="text-surface-400 flex-shrink-0" />
              <span className="text-surface-600 dark:text-surface-400">{user.phone || '—'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-body-sm">
              <MapPin size={15} className="text-surface-400 flex-shrink-0" />
              <span className="text-surface-600 dark:text-surface-400">
                {user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-body-sm">
              <Calendar size={15} className="text-surface-400 flex-shrink-0" />
              <span className="text-surface-600 dark:text-surface-400">
                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Orders" value={String(orders.length)} icon={Package} color="text-blue-600 bg-blue-500/10" />
        <KPICard label="Total Spent" value={formatPrice(totalSpent)} icon={IndianRupee} color="text-green-600 bg-green-500/10" />
        <KPICard label="Avg Order" value={formatPrice(avgOrder)} icon={TrendingUp} color="text-purple-600 bg-purple-500/10" />
        <KPICard label="Delivered" value={String(deliveredCount)} icon={ShoppingBag} color="text-amber-600 bg-amber-500/10" />
      </div>

      {/* Order History — full width */}
      <DataTable
        columns={[
          { key: 'id', label: 'Order' },
          { key: 'items', label: 'Items' },
          { key: 'total', label: 'Total' },
          { key: 'status', label: 'Status' },
          { key: 'payment', label: 'Payment' },
          { key: 'date', label: 'Date' },
        ]}
        isLoading={false}
        isEmpty={orders.length === 0}
        emptyIcon={<ShoppingBag size={24} className="text-surface-400" />}
        emptyTitle="No orders yet"
        emptyDescription="This user hasn't placed any orders"
      >
        {orders.map((order) => (
          <tr
            key={order.id}
            onClick={() => navigate(`/admin/orders/${order.id}`)}
            className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors"
          >
            <td className="px-5 py-3.5">
              <Link
                to={`/admin/orders/${order.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-body-sm font-medium text-brand-600 hover:underline"
              >
                #{order.id.slice(0, 8)}
              </Link>
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-600 dark:text-surface-400">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </td>
            <td className="px-5 py-3.5 text-body-sm font-medium text-surface-900 dark:text-surface-100 tabular-nums">
              {formatPrice(order.total)}
            </td>
            <td className="px-5 py-3.5">
              <StatusBadge status={order.status} type="order" />
            </td>
            <td className="px-5 py-3.5">
              <StatusBadge status={order.paymentMethod === 'cod' ? 'cod' : 'online'} type="payment" />
            </td>
            <td className="px-5 py-3.5 text-body-sm text-surface-500">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
