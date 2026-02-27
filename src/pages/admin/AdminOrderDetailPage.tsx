import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, CheckCircle2, Clock, XCircle, Package, MapPin, CreditCard, Hash, ChevronLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils.ts';
import { AdminCard } from '@/components/admin/AdminCard.tsx';
import { StatusBadge } from '@/components/admin/StatusBadge.tsx';
import { SkeletonCard } from '@/components/admin/Skeleton.tsx';
import type { AdminOrder } from '@/types/admin.ts';
import type { OrderStatus } from '@/types/index.ts';

const allStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusIcons: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Clock,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle,
};

const statusIconColors: Record<OrderStatus, string> = {
  pending: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
  confirmed: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10',
  processing: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10',
  shipped: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10',
  delivered: 'text-green-600 bg-green-50 dark:bg-green-500/10',
  cancelled: 'text-red-600 bg-red-50 dark:bg-red-500/10',
};

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-body-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-shadow';

export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [trackingId, setTrackingId] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const { getAdminOrderById } = await import('@/services/admin.ts');
        const result = await getAdminOrderById(orderId);
        if (result) {
          setOrder(result);
          setNewStatus(result.status);
          setTrackingId(result.trackingId ?? '');
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!order || !orderId) return;
    setIsSaving(true);
    try {
      const { updateOrderStatus } = await import('@/services/admin.ts');
      await updateOrderStatus(orderId, order.userId, newStatus, statusNote);
      setOrder({ ...order, status: newStatus });
      setStatusNote('');
    } catch {
      // handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!order || !orderId) return;
    setIsSaving(true);
    try {
      const { updateOrderTracking } = await import('@/services/admin.ts');
      await updateOrderTracking(orderId, order.userId, trackingId);
      setOrder({ ...order, trackingId });
    } catch {
      // handle error
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <Package size={24} className="text-surface-400" />
          </div>
          <p className="text-body-md font-medium text-surface-900 dark:text-surface-100 mb-1">Order not found</p>
          <p className="text-body-sm text-surface-500 mb-4">This order may have been removed or the ID is incorrect.</p>
          <Link to="/admin/orders" className="text-body-sm text-brand-600 font-medium hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status] ?? Clock;

  return (
    <div className="space-y-6">
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
        <ChevronLeft size={16} />
        Back to Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <AdminCard title="Order Items">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-2 -mx-2 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-surface-100 dark:bg-surface-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-caption text-surface-400">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-body-sm font-semibold text-surface-900 dark:text-surface-100 tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 space-y-2">
              <div className="flex justify-between text-body-sm">
                <span className="text-surface-500">Subtotal</span>
                <span className="text-surface-900 dark:text-surface-100 tabular-nums">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-surface-500">Shipping</span>
                <span className="text-surface-900 dark:text-surface-100 tabular-nums">
                  {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-body-md font-semibold pt-2 border-t border-surface-100 dark:border-surface-800">
                <span className="text-surface-900 dark:text-surface-50">Total</span>
                <span className="text-surface-900 dark:text-surface-50 tabular-nums">{formatPrice(order.total)}</span>
              </div>
            </div>
          </AdminCard>

          {/* Shipping Address */}
          <AdminCard
            title="Shipping Address"
            titleAction={
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <MapPin size={16} className="text-surface-400" />
              </div>
            }
          >
            <div className="text-body-sm text-surface-600 dark:text-surface-400 space-y-1">
              <p className="font-medium text-surface-900 dark:text-surface-100">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p className="pt-1 text-surface-500">Phone: {order.shippingAddress.phone}</p>
            </div>
          </AdminCard>

          {/* Status History — Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <AdminCard title="Status History">
              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-surface-200 dark:bg-surface-700" />
                <div className="space-y-5">
                  {order.statusHistory.map((entry, i) => {
                    const EntryIcon = statusIcons[entry.status as OrderStatus] ?? Clock;
                    const iconColor = statusIconColors[entry.status as OrderStatus] ?? 'text-surface-500 bg-surface-100 dark:bg-surface-800';
                    return (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className={`relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                          <EntryIcon size={14} />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 capitalize">
                            {entry.status}
                          </p>
                          <p className="text-caption text-surface-400">
                            {new Date(entry.changedAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {entry.note && (
                            <p className="text-caption text-surface-500 mt-0.5 italic">
                              &ldquo;{entry.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AdminCard>
          )}
        </div>

        {/* Right — Sidebar Actions */}
        <div className="space-y-6">
          {/* Current Status */}
          <AdminCard title="Current Status">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusIconColors[order.status] ?? 'text-surface-500 bg-surface-100'}`}>
                <StatusIcon size={20} />
              </div>
              <div>
                <StatusBadge status={order.status} type="order" />
              </div>
            </div>
          </AdminCard>

          {/* Update Status */}
          <AdminCard title="Update Status">
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className={inputClass}
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={2}
                className={`${inputClass} resize-none`}
              />
              <button
                onClick={handleStatusUpdate}
                disabled={isSaving || newStatus === order.status}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm shadow-brand-500/20"
              >
                {isSaving ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </AdminCard>

          {/* Tracking */}
          <AdminCard
            title="Tracking"
            titleAction={
              <div className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <Hash size={14} className="text-surface-400" />
              </div>
            }
          >
            <div className="space-y-3">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID"
                className={inputClass}
              />
              <button
                onClick={handleTrackingUpdate}
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-body-sm font-semibold hover:bg-surface-800 dark:hover:bg-surface-200 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Tracking ID'}
              </button>
            </div>
          </AdminCard>

          {/* Payment Info */}
          <AdminCard
            title="Payment"
            titleAction={
              <div className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <CreditCard size={14} className="text-surface-400" />
              </div>
            }
          >
            <div className="text-body-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-surface-500">Method</span>
                <span className="text-surface-900 dark:text-surface-100 capitalize font-medium">{order.paymentMethod}</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between gap-2">
                  <span className="text-surface-500 flex-shrink-0">Payment ID</span>
                  <span className="text-surface-900 dark:text-surface-100 font-mono text-caption truncate">{order.paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-surface-500">Amount</span>
                <span className="text-surface-900 dark:text-surface-100 font-semibold tabular-nums">{formatPrice(order.total)}</span>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
