import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { getOrderById } from '@/services/firestore.ts';
import { formatPrice } from '@/lib/utils.ts';
import type { Order } from '@/types/index.ts';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) return;
    getOrderById(user.uid, orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user, orderId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: `/order-confirmation/${orderId}` }} replace />;
  }

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="w-10 h-10 rounded-full border-3 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center">
          <p className="text-body-lg text-surface-500">Order not found</p>
          <Link to="/shop" className="mt-4 inline-block">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (order.shipping > 0 ? 3 : 7));

  return (
    <div className="pt-16 lg:pt-18 min-h-screen bg-surface-50 dark:bg-surface-950">
      <Container size="narrow">
        <div className="py-12 lg:py-16">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
              >
                <CheckCircle size={48} className="text-emerald-500" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center mb-10"
          >
            <h1 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">
              Order Confirmed!
            </h1>
            <p className="mt-3 text-body-lg text-surface-500">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-surface-200 dark:border-surface-800 mb-6"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-200 dark:border-surface-800">
              <div>
                <p className="text-body-sm text-surface-500">Order Number</p>
                <p className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-body-sm text-surface-500">Payment ID</p>
                <p className="text-body-sm font-medium text-surface-700 dark:text-surface-300">
                  {order.paymentId ?? order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-6">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-850 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-caption text-surface-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-body-sm font-bold text-surface-900 dark:text-surface-100">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-surface-200 dark:border-surface-800 space-y-2">
              <div className="flex justify-between text-body-sm text-surface-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-surface-500">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
                <span className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">
                  Total Paid
                </span>
                <span className="font-display font-bold text-heading-sm text-brand-600 dark:text-brand-400">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Estimated Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center">
                <Package size={20} className="text-brand-500" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-surface-900 dark:text-surface-100">
                  Estimated Delivery
                </p>
                <p className="text-body-sm text-surface-500">
                  {estimatedDelivery.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/shop">
              <Button size="lg">
                <ShoppingBag size={18} />
                Continue Shopping
              </Button>
            </Link>
            <Link to="/account/orders">
              <Button size="lg" variant="outline">
                View Orders
                <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
