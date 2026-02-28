import { motion } from 'framer-motion';
import {
  Truck, Clock, MapPin, Package,
  Globe, Navigation, AlertTriangle,
} from 'lucide-react';
import { PolicyLayout, type PolicySection } from '@/components/atoms/PolicyLayout.tsx';
import { SEO } from '@/components/SEO.tsx';

const shippingOptions = [
  { icon: Truck, method: 'Standard Delivery', time: '5-7 Business Days', cost: 'FREE above ₹999', desc: 'Available across all 28 states. ₹99 flat fee for orders below ₹999.' },
  { icon: Clock, method: 'Express Delivery', time: '2-3 Business Days', cost: '₹199', desc: 'Faster delivery with priority handling and real-time tracking.' },
  { icon: MapPin, method: 'Same Day (Select Cities)', time: 'Same Day', cost: '₹399', desc: 'Available in Sivakasi, Chennai, Mumbai, Delhi, Bangalore during festival season.' },
];

const sections: PolicySection[] = [
  {
    id: 'shipping-options',
    icon: Truck,
    title: 'Shipping Options',
    summary: 'Free standard delivery above ₹999, express 2-3 day shipping, and same-day delivery in select cities.',
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {shippingOptions.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.div
              key={opt.method}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-brand-500" />
              </div>
              <h3 className="font-display font-bold text-body-md text-surface-900 dark:text-surface-100">{opt.method}</h3>
              <p className="text-brand-500 font-semibold text-body-sm mt-1">{opt.time}</p>
              <p className="text-body-sm text-surface-500 mt-1">{opt.cost}</p>
              <p className="text-caption text-surface-400 mt-2">{opt.desc}</p>
            </motion.div>
          );
        })}
      </div>
    ),
  },
  {
    id: 'order-processing',
    icon: Clock,
    title: 'Order Processing',
    summary: 'Orders are processed within 24-48 hours. During festivals, it may take up to 72 hours.',
    content: (
      <>
        <p>All orders are processed within 24-48 hours of payment confirmation. During peak festival seasons (Diwali: October-November, New Year: December), processing may take up to 72 hours due to high demand.</p>
        <p>You will receive an email confirmation with your order ID immediately after placing your order, followed by a shipping confirmation with tracking details once your package is dispatched.</p>
      </>
    ),
  },
  {
    id: 'packaging',
    icon: Package,
    title: 'Packaging & Safety',
    summary: 'All fireworks are packed with flame-retardant materials and comply with Indian explosives transport regulations.',
    content: (
      <>
        <p>All fireworks are packed in compliance with Indian explosives transport regulations. Our packaging includes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Flame-retardant outer packaging</li>
          <li>Shock-absorbing inner cushioning</li>
          <li>Moisture-proof sealing</li>
          <li>Proper hazardous goods labeling (UN classification)</li>
          <li>Temperature indicators for heat-sensitive products</li>
        </ul>
        <p>We use only licensed carriers authorized for pyrotechnic transport under the Indian Explosives Act.</p>
      </>
    ),
  },
  {
    id: 'coverage',
    icon: Globe,
    title: 'Delivery Coverage',
    summary: 'We deliver across all 28 states and 8 union territories. Some remote areas may have extended timelines.',
    content: (
      <>
        <p>We deliver across all 28 states and 8 union territories of India. Some remote or restricted areas may have limited availability or extended delivery timelines. Enter your PIN code during checkout to confirm serviceability and estimated delivery dates.</p>
        <p className="font-medium text-surface-900 dark:text-surface-100">Note: Certain states may have seasonal restrictions on fireworks transport. We will notify you if your order is affected and offer a full refund or rescheduled delivery.</p>
      </>
    ),
  },
  {
    id: 'tracking',
    icon: Navigation,
    title: 'Tracking Your Order',
    summary: 'Track your package via email, SMS, or our Track Order page using your Order ID.',
    content: (
      <p>Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track your order anytime on our <a href="/track-order" className="text-brand-500 hover:underline font-medium">Track Order</a> page using your Order ID.</p>
    ),
  },
  {
    id: 'damaged',
    icon: AlertTriangle,
    title: 'Damaged or Missing Items',
    summary: 'Report damaged or missing items within 48 hours for immediate replacement or full refund.',
    content: (
      <>
        <p>If your package arrives damaged or items are missing, please contact us within 48 hours of delivery with photographs. We will arrange an immediate replacement or full refund at no cost to you.</p>
        <p>Contact: <a href="mailto:hello@akashcrackers.com" className="text-brand-500 hover:underline font-medium">hello@akashcrackers.com</a> or call <span className="font-medium text-surface-900 dark:text-surface-100">+91 98765 43210</span></p>
      </>
    ),
  },
];

export function ShippingPage() {
  return (
    <>
      <SEO
        title="Shipping Policy — Free Delivery Above ₹999"
        description="Akash Crackers shipping policy. Free standard delivery above ₹999, express 2-3 day shipping, and same-day delivery in select cities. Pan-India coverage."
        canonical="/shipping"
      />
      <PolicyLayout
        title="Shipping Policy"
        eyebrow="Delivery"
        description="Everything you need to know about how we deliver your fireworks safely and on time."
        lastUpdated="February 1, 2026"
        sections={sections}
      />
    </>
  );
}
