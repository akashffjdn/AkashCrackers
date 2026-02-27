import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, IndianRupee, Calendar, Eye, Users, ChevronLeft } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar.tsx';
import { formatPrice } from '@/lib/utils.ts';
import { AdminCard } from '@/components/admin/AdminCard.tsx';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import { SkeletonLine, SkeletonCircle, SkeletonCard } from '@/components/admin/Skeleton.tsx';
import type { UserProfile, Order, UserRole } from '@/types/index.ts';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-body-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-shadow';

export function AdminCustomerDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [role, setRole] = useState<UserRole>('user');

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const { getCustomerById, getCustomerOrders } = await import('@/services/admin.ts');
        const [cust, custOrders] = await Promise.all([getCustomerById(uid), getCustomerOrders(uid)]);
        if (cust) {
          setCustomer(cust);
          setRole(cust.role ?? 'user');
        }
        setOrders(custOrders);
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [uid]);

  const handleRoleUpdate = async () => {
    if (!uid) return;
    setIsSaving(true);
    try {
      const { updateUserRole } = await import('@/services/admin.ts');
      await updateUserRole(uid, role);
      if (customer) setCustomer({ ...customer, role });
    } catch {
      // handle error
    } finally {
      setIsSaving(false);
    }
  };

  const totalSpend = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ChevronLeft size={16} />
          Back to Customers
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <AdminCard>
              <div className="flex flex-col items-center gap-3">
                <SkeletonCircle className="w-16 h-16" />
                <SkeletonLine className="h-5 w-32" />
                <SkeletonLine className="h-4 w-40" />
              </div>
            </AdminCard>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ChevronLeft size={16} />
          Back to Customers
        </Link>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <Users size={24} className="text-surface-400" />
          </div>
          <p className="text-body-md font-medium text-surface-900 dark:text-surface-100 mb-1">Customer not found</p>
          <Link to="/admin/customers" className="text-body-sm text-brand-600 font-medium hover:underline mt-2">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
        <ChevronLeft size={16} />
        Back to Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile & Role */}
        <div className="space-y-6">
          {/* Profile Card */}
          <AdminCard>
            <div className="flex flex-col items-center text-center">
              <Avatar src={customer.photoURL} name={customer.displayName} size="lg" />
              <h2 className="mt-3 font-display font-semibold text-body-lg text-surface-900 dark:text-surface-50">
                {customer.displayName || 'Unnamed'}
              </h2>
              <p className="text-body-sm text-surface-500">{customer.email}</p>
              {customer.phone && <p className="text-body-sm text-surface-400 mt-0.5">{customer.phone}</p>}
              <div className="mt-3">
                <StatusBadge status={customer.role ?? 'user'} type="role" />
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-surface-100 dark:border-surface-800 space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Member since</span>
                <span className="text-surface-900 dark:text-surface-100">
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Total orders</span>
                <span className="text-surface-900 dark:text-surface-100 font-medium">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Total spend</span>
                <span className="text-surface-900 dark:text-surface-100 font-semibold tabular-nums">
                  {formatPrice(totalSpend)}
                </span>
              </div>
            </div>
          </AdminCard>

          {/* Role Management */}
          <AdminCard title="Manage Role">
            <div className="space-y-3">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={inputClass}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleRoleUpdate}
                disabled={isSaving || role === (customer.role ?? 'user')}
                className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm shadow-brand-500/20"
              >
                {isSaving ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </AdminCard>
        </div>

        {/* Right — Stats & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 bg-blue-500/10">
                <ShoppingBag size={20} />
              </div>
              <p className="mt-4 font-display font-bold text-display-xs text-surface-900 dark:text-surface-50">{orders.length}</p>
              <p className="text-body-sm text-surface-500 mt-1">Total Orders</p>
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-green-600 bg-green-500/10">
                <IndianRupee size={20} />
              </div>
              <p className="mt-4 font-display font-bold text-display-xs text-surface-900 dark:text-surface-50">
                {formatPrice(totalSpend)}
              </p>
              <p className="text-body-sm text-surface-500 mt-1">Total Spend</p>
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 bg-purple-500/10">
                <Calendar size={20} />
              </div>
              <p className="mt-4 font-display font-bold text-display-xs text-surface-900 dark:text-surface-50">
                {customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : '—'}
              </p>
              <p className="text-body-sm text-surface-500 mt-1">Member Since</p>
            </div>
          </div>

          {/* Order History */}
          <AdminCard
            title={`Order History (${orders.length})`}
            noPadding
          >
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                  <ShoppingBag size={24} className="text-surface-400" />
                </div>
                <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">No orders yet</p>
                <p className="text-caption text-surface-400 mt-1">This customer hasn&apos;t placed any orders.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100 dark:border-surface-800">
                      <th className="text-left text-caption font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Order</th>
                      <th className="text-left text-caption font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Total</th>
                      <th className="text-left text-caption font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-caption font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Date</th>
                      <th className="text-left text-caption font-medium text-surface-500 uppercase tracking-wider px-5 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="border-b border-surface-50 dark:border-surface-850 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 text-body-sm font-medium text-surface-900 dark:text-surface-100">
                          #{o.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3.5 text-body-sm font-semibold text-surface-900 dark:text-surface-100 tabular-nums">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={o.status} type="order" />
                        </td>
                        <td className="px-5 py-3.5 text-body-sm text-surface-500">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/admin/orders/${o.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-500/10 transition-colors inline-flex"
                          >
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
