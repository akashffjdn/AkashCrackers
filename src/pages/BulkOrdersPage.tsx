import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Users, Percent, Headphones,
  CheckCircle, Send, ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { SEO } from '@/components/SEO.tsx';
import { cn } from '@/lib/utils.ts';

const benefits = [
  { icon: Percent, title: 'Wholesale Pricing', desc: 'Up to 30% off on orders above ₹25,000. The more you order, the more you save.' },
  { icon: Package, title: 'Custom Packages', desc: 'We curate custom assortments tailored to your event type, audience, and budget.' },
  { icon: Users, title: 'Dedicated Manager', desc: 'Get a personal account manager for seamless ordering, logistics, and support.' },
  { icon: Headphones, title: 'Priority Support', desc: 'Skip the queue. Bulk clients get direct phone and WhatsApp access to our team.' },
];

const tiers = [
  { range: '₹10,000 – ₹24,999', discount: '10%', label: 'Starter' },
  { range: '₹25,000 – ₹49,999', discount: '15%', label: 'Business' },
  { range: '₹50,000 – ₹99,999', discount: '20%', label: 'Premium' },
  { range: '₹1,00,000+', discount: '30%', label: 'Enterprise' },
];

const inputClass = cn(
  'w-full px-4 py-3 rounded-xl text-body-md',
  'bg-white dark:bg-surface-850',
  'border border-surface-200 dark:border-surface-700',
  'text-surface-900 dark:text-surface-100',
  'placeholder:text-surface-400 dark:placeholder:text-surface-500',
  'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
  'transition-colors',
);

export function BulkOrdersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', eventType: '', budget: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-16 lg:pt-18 min-h-screen">
      <SEO
        title="Bulk & Wholesale Fireworks Orders — Up to 30% Off"
        description="Order fireworks in bulk for weddings, Diwali, corporate events, and retail. Wholesale pricing up to 30% off, custom packages, and dedicated account manager."
        canonical="/bulk-orders"
      />
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1920&q=30')] bg-cover bg-center opacity-10" />
        <Container size="narrow" className="relative z-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Package size={16} className="text-white" />
              <span className="text-body-sm font-medium text-white">For Events, Retailers & Wholesalers</span>
            </span>
            <h1 className="font-display font-bold text-display-sm sm:text-display-md text-white">
              Bulk & Wholesale Orders
            </h1>
            <p className="mt-4 text-body-lg text-white/70 max-w-xl mx-auto">
              Special pricing, custom packages, and dedicated support for large orders. Perfect for events, retailers, and businesses.
            </p>
          </div>
        </Container>
      </section>

      {/* Pricing Tiers */}
      <section className="py-12 bg-white dark:bg-surface-900">
        <Container size="wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800"
              >
                <p className="text-label font-bold uppercase tracking-wider text-brand-500">{tier.label}</p>
                <p className="mt-2 font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">{tier.discount}</p>
                <p className="text-body-sm text-surface-500">discount</p>
                <p className="mt-3 text-body-sm text-surface-400">{tier.range}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="wide">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">Why Order in Bulk?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-brand-500" />
                  </div>
                  <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">{b.title}</h3>
                  <p className="mt-2 text-body-sm text-surface-500 dark:text-surface-400">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Inquiry Form */}
      <section className="section-padding bg-white dark:bg-surface-900">
        <Container size="narrow">
          <div className="bg-surface-50 dark:bg-surface-850 rounded-2xl p-6 lg:p-10 border border-surface-200 dark:border-surface-800">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">Inquiry Submitted!</h3>
                <p className="mt-2 text-body-md text-surface-500">Our bulk order team will contact you within 24 hours with a custom quote.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-body-sm text-brand-500 hover:underline">Submit another inquiry</button>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="font-display font-bold text-heading-lg text-surface-900 dark:text-surface-50">Request a Quote</h2>
                  <p className="mt-2 text-body-md text-surface-500">Tell us about your needs and we'll prepare a custom offer.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className={inputClass} />
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Company / Event name" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required className={inputClass} />
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone number" required className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select name="eventType" value={form.eventType} onChange={handleChange} required className={inputClass}>
                      <option value="">Event type</option>
                      <option value="wedding">Wedding / Reception</option>
                      <option value="festival">Festival / Diwali</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="retail">Retail / Resale</option>
                      <option value="other">Other</option>
                    </select>
                    <select name="budget" value={form.budget} onChange={handleChange} required className={inputClass}>
                      <option value="">Estimated budget</option>
                      <option value="10k-25k">₹10,000 – ₹25,000</option>
                      <option value="25k-50k">₹25,000 – ₹50,000</option>
                      <option value="50k-1l">₹50,000 – ₹1,00,000</option>
                      <option value="1l+">₹1,00,000+</option>
                    </select>
                  </div>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us more about your requirements..." rows={4} className={cn(inputClass, 'resize-none')} />
                  <Button type="submit" size="lg" fullWidth>
                    <Send size={18} />
                    Submit Inquiry
                  </Button>
                </form>
              </>
            )}
          </div>
        </Container>
      </section>

      {/* Quick Order CTA */}
      <section className="py-12 bg-surface-50 dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800">
        <Container size="narrow">
          <div className="text-center">
            <p className="text-body-lg text-surface-500 dark:text-surface-400">Know exactly what you need?</p>
            <Link to="/quick-order" className="inline-flex items-center gap-2 mt-2 text-brand-500 font-semibold hover:underline">
              Use our Quick Order tool <ArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
