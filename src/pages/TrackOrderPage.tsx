import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Package, Truck, CheckCircle,
  MapPin, Clock, Box, ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { SEO } from '@/components/SEO.tsx';
import { cn } from '@/lib/utils.ts';

interface TrackingStep {
  label: string;
  desc: string;
  time: string;
  icon: typeof Package;
  completed: boolean;
  active: boolean;
}

const demoSteps: TrackingStep[] = [
  { label: 'Order Placed', desc: 'Your order has been confirmed', time: 'Feb 20, 2026 — 3:42 PM', icon: Box, completed: true, active: false },
  { label: 'Processing', desc: 'Items are being packed securely', time: 'Feb 21, 2026 — 10:15 AM', icon: Package, completed: true, active: false },
  { label: 'Shipped', desc: 'Package handed to delivery partner', time: 'Feb 22, 2026 — 2:30 PM', icon: Truck, completed: true, active: false },
  { label: 'In Transit', desc: 'Your package is on its way', time: 'Feb 23, 2026 — 8:00 AM', icon: MapPin, completed: false, active: true },
  { label: 'Delivered', desc: 'Package delivered to your address', time: 'Expected: Feb 25, 2026', icon: CheckCircle, completed: false, active: false },
];

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) setIsTracking(true);
  };

  return (
    <div className="pt-16 lg:pt-18 min-h-screen">
      <SEO
        title="Track Your Order — Real-Time Delivery Status"
        description="Track your Akash Crackers order in real-time. Enter your order ID to see delivery status, estimated arrival, and shipment progress."
        canonical="/track-order"
      />
      {/* Header */}
      <section className="pt-8 pb-10 lg:pt-10 lg:pb-14 bg-white dark:bg-surface-900">
        <Container size="narrow">
          <div className="text-center">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">Order Tracking</span>
            <h1 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50">
              Track Your Order
            </h1>
            <p className="mt-4 text-body-lg text-surface-500 dark:text-surface-400">
              Enter your order ID to see real-time delivery status.
            </p>

            {/* Search */}
            <form onSubmit={handleTrack} className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => { setOrderId(e.target.value); setIsTracking(false); }}
                  placeholder="Enter Order ID (e.g. AK-2026-78432)"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-body-md text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
              <Button type="submit" size="lg">
                Track
                <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        </Container>
      </section>

      {/* Tracking Result */}
      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="narrow">
          {isTracking ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Order Summary Card */}
              <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-surface-200 dark:border-surface-800 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-surface-200 dark:border-surface-800">
                  <div>
                    <p className="text-label font-bold uppercase tracking-wider text-brand-500 mb-1">Order ID</p>
                    <p className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">
                      AK-2026-{orderId.replace(/\D/g, '').slice(0, 5) || '78432'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-body-sm font-semibold text-blue-600 dark:text-blue-400">In Transit</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-body-sm">
                  <div>
                    <p className="text-surface-500 mb-1">Placed On</p>
                    <p className="font-medium text-surface-900 dark:text-surface-100">Feb 20, 2026</p>
                  </div>
                  <div>
                    <p className="text-surface-500 mb-1">Expected</p>
                    <p className="font-medium text-surface-900 dark:text-surface-100">Feb 25, 2026</p>
                  </div>
                  <div>
                    <p className="text-surface-500 mb-1">Items</p>
                    <p className="font-medium text-surface-900 dark:text-surface-100">3 products</p>
                  </div>
                  <div>
                    <p className="text-surface-500 mb-1">Carrier</p>
                    <p className="font-medium text-surface-900 dark:text-surface-100">SafeShip Express</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-surface-200 dark:border-surface-800">
                <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50 mb-8">
                  Delivery Progress
                </h3>
                <div className="relative">
                  {demoSteps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="flex gap-4 pb-8 last:pb-0"
                      >
                        {/* Line + Dot */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                            step.completed ? 'bg-emerald-500 text-white' :
                            step.active ? 'bg-brand-500 text-surface-950 shadow-glow animate-pulse-soft' :
                            'bg-surface-200 dark:bg-surface-700 text-surface-400',
                          )}>
                            <Icon size={18} />
                          </div>
                          {i < demoSteps.length - 1 && (
                            <div className={cn(
                              'w-0.5 flex-1 mt-1',
                              step.completed ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700',
                            )} />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-2">
                          <h4 className={cn(
                            'font-display font-semibold text-body-lg',
                            step.completed || step.active ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400',
                          )}>
                            {step.label}
                          </h4>
                          <p className="text-body-sm text-surface-500 dark:text-surface-400">{step.desc}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-caption text-surface-400">
                            <Clock size={12} />
                            {step.time}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                <Package size={36} className="text-surface-400" />
              </div>
              <p className="text-body-lg text-surface-500">Enter your order ID above to track your shipment</p>
              <p className="mt-2 text-body-sm text-surface-400">You can find your order ID in your confirmation email</p>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
