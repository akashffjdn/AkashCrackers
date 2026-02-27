import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { EmptyState } from '@/components/atoms/EmptyState.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { useAuthStore } from '@/store/auth.ts';
import { getOrders } from '@/services/firestore.ts';
import { formatPrice, cn } from '@/lib/utils.ts';
import type { Order, OrderStatus } from '@/types/index.ts';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  processing: { label: 'Processing', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  shipped: { label: 'Shipped', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

const tabs: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Active' },
  { value: 'delivered', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) return;
    getOrders(user.uid)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  const filtered = activeTab === 'all'
    ? orders
    : activeTab === 'pending'
      ? orders.filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status))
      : orders.filter((o) => o.status === activeTab);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
        Order History
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2 rounded-xl text-body-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={36} className="text-surface-400" />}
          title="No orders yet"
          description="Your order history will appear here once you make a purchase."
          action={<Link to="/shop"><Button>Browse Products</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = statusConfig[order.status];
            return (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 hover:border-brand-500/30 transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-display font-bold text-body-lg text-surface-900 dark:text-surface-50">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <span className={cn('px-2.5 py-1 rounded-lg text-caption font-bold uppercase', status.color)}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-body-sm text-surface-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span className="font-semibold text-surface-700 dark:text-surface-300">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-surface-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
