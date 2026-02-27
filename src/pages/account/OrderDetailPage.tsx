import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/atoms/Button.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { getOrderById } from '@/services/firestore.ts';
import { formatPrice, cn } from '@/lib/utils.ts';
import type { Order, OrderStatus } from '@/types/index.ts';

const timelineSteps: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'pending', label: 'Order Placed', icon: Package },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: MapPin },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const user = useAuthStore((s) => s.user);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) return;
    getOrderById(user.uid, orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-body-lg text-surface-500">Order not found</p>
        <Link to="/account/orders"><Button className="mt-4">Back to Orders</Button></Link>
      </div>
    );
  }

  const currentStep = statusIndex[order.status];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-body-sm text-surface-500 hover:text-brand-500 transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
        Order #{order.id.slice(0, 8).toUpperCase()}
      </h2>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 mb-6">
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i <= currentStep;
              const isActive = i === currentStep;
              return (
                <div key={step.status} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div className={cn('absolute top-5 right-1/2 w-full h-0.5', i <= currentStep ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700')} />
                  )}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center z-10',
                    isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-brand-500 text-surface-950' : 'bg-surface-200 dark:bg-surface-700 text-surface-400',
                  )}>
                    <Icon size={18} />
                  </div>
                  <p className={cn('mt-2 text-caption font-medium text-center', isCompleted || isActive ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400')}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
          <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50 mb-4">Items</h3>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-14 h-14 rounded-xl bg-surface-100 dark:bg-surface-850 overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`} className="font-medium text-body-md text-surface-900 dark:text-surface-100 hover:text-brand-500 truncate block">
                    {item.name}
                  </Link>
                  <p className="text-body-sm text-surface-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-display font-bold text-body-md text-surface-900 dark:text-surface-100">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
            <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50 mb-4">Summary</h3>
            <div className="space-y-2 text-body-sm">
              <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span className="text-surface-900 dark:text-surface-100">{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span className="text-surface-900 dark:text-surface-100">{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between pt-2 border-t border-surface-100 dark:border-surface-800 font-display font-bold text-body-lg">
                <span className="text-surface-900 dark:text-surface-50">Total</span>
                <span className="text-brand-600 dark:text-brand-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
            <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50 mb-3">Details</h3>
            <div className="space-y-3 text-body-sm">
              <div className="flex items-start gap-2"><Clock size={16} className="text-surface-400 mt-0.5 flex-shrink-0" /><span className="text-surface-600 dark:text-surface-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div className="flex items-start gap-2"><CreditCard size={16} className="text-surface-400 mt-0.5 flex-shrink-0" /><span className="text-surface-600 dark:text-surface-400">{order.paymentMethod}</span></div>
              <div className="flex items-start gap-2"><MapPin size={16} className="text-surface-400 mt-0.5 flex-shrink-0" /><span className="text-surface-600 dark:text-surface-400">{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</span></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
