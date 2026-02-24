import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageSquare, Phone } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { siteConfig } from '@/config/site.ts';
import { cn } from '@/lib/utils.ts';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'Ordering & Payment',
    icon: '🛒',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), net banking, and cash on delivery for select locations. For bulk orders above ₹50,000 we also accept bank transfers.' },
      { q: 'Is there a minimum order amount?', a: 'There is no minimum order for standard purchases. However, free shipping is available on orders above ₹999. Bulk/wholesale orders have a minimum of ₹10,000.' },
      { q: 'Can I modify or cancel my order after placing it?', a: 'You can modify or cancel your order within 2 hours of placement by contacting our support team. After dispatch, cancellation is not possible but you can initiate a return once delivered.' },
      { q: 'Do you offer cash on delivery?', a: 'Yes, COD is available for orders up to ₹25,000 in serviceable pin codes. A nominal COD fee of ₹49 applies.' },
    ],
  },
  {
    title: 'Shipping & Delivery',
    icon: '🚚',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days. Express delivery (2-3 days) is available at an additional charge. During peak festival season (October-November), please allow 1-2 extra days.' },
      { q: 'Do you ship across India?', a: 'Yes, we ship to all 28 states and 8 union territories. Some remote areas may have extended delivery timelines. Enter your pin code at checkout to see estimated delivery dates.' },
      { q: 'Is shipping free?', a: 'Standard shipping is free on all orders above ₹999. Orders below ₹999 have a flat shipping fee of ₹99. Express shipping is ₹199 regardless of order value.' },
      { q: 'How are fireworks shipped safely?', a: 'All products are packed in flame-retardant, shock-absorbing packaging with proper hazardous goods labeling. We use licensed carriers authorized for pyrotechnic transport under Indian regulations.' },
    ],
  },
  {
    title: 'Products & Safety',
    icon: '🛡️',
    items: [
      { q: 'Are all products BIS certified?', a: 'Yes, every product in our catalog carries BIS (Bureau of Indian Standards) certification. We do not sell any uncertified or banned products. Certificate details are available on each product page.' },
      { q: 'What does the "Low Noise" badge mean?', a: 'Products marked "Low Noise" produce sound levels below 90 decibels — suitable for residential areas, children, and noise-sensitive settings. These comply with Supreme Court guidelines on noise pollution.' },
      { q: 'Do you have products safe for children?', a: 'Yes! Products rated "Family Safe" are specifically designed for children under adult supervision. This includes sparklers, smoke balls, pop-pops, and low-noise ground effects. Look for the green "LOW NOISE" badge.' },
      { q: 'What is the shelf life of fireworks?', a: 'When stored in a cool, dry place away from direct sunlight, our fireworks have a shelf life of 2-3 years. Always check packaging for manufacture date and storage instructions.' },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: '↩️',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for unopened, undamaged products in original packaging. Damaged-on-arrival items are eligible for immediate replacement — just share photos within 48 hours of delivery.' },
      { q: 'How long do refunds take?', a: 'Once we receive and inspect the returned items, refunds are processed within 5-7 business days. The amount is credited back to your original payment method.' },
      { q: 'What if I receive a damaged product?', a: 'Contact us within 48 hours of delivery with photos of the damaged items. We will arrange a free replacement or full refund — no questions asked.' },
    ],
  },
  {
    title: 'Bulk & Custom Orders',
    icon: '📦',
    items: [
      { q: 'Do you offer wholesale pricing?', a: 'Yes! Orders above ₹25,000 qualify for wholesale rates with 15-30% discounts depending on volume. Visit our Bulk Orders page or contact us directly for a custom quote.' },
      { q: 'Can you create custom packages for events?', a: 'Absolutely. Our event specialists can design custom fireworks packages for weddings, corporate events, festivals, and private celebrations. This includes show sequencing, safety planning, and professional firing guides.' },
      { q: 'Do you provide professional display services?', a: 'For events requiring professional pyrotechnic displays, we partner with licensed operators. Contact us with your event details for a comprehensive quote including product, setup, and operator services.' },
    ],
  },
];

export function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<number>(0);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredCategories = search.trim()
    ? faqData.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((cat) => cat.items.length > 0)
    : [faqData[activeCategory]];

  return (
    <div className="pt-16 lg:pt-18 min-h-screen">
      {/* Header */}
      <section className="pt-8 pb-10 lg:pt-10 lg:pb-14 bg-white dark:bg-surface-900">
        <Container size="narrow">
          <div className="text-center">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">Help Center</span>
            <h1 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-body-lg text-surface-500 dark:text-surface-400">
              Everything you need to know about ordering, safety, shipping, and more.
            </p>

            {/* Search */}
            <div className="relative mt-8 max-w-lg mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for answers..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-body-md text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Tabs (sidebar) */}
            {!search.trim() && (
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-1">
                  {faqData.map((cat, i) => (
                    <button
                      key={cat.title}
                      onClick={() => setActiveCategory(i)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-body-sm font-medium transition-all duration-200',
                        activeCategory === i
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                          : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                      )}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      {cat.title}
                      <span className="ml-auto text-caption text-surface-400">{cat.items.length}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            <div className={cn(search.trim() ? 'lg:col-span-4' : 'lg:col-span-3')}>
              {filteredCategories.map((cat) => (
                <div key={cat.title} className="mb-8 last:mb-0">
                  {search.trim() && (
                    <h3 className="flex items-center gap-2 font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50 mb-4">
                      <span>{cat.icon}</span> {cat.title}
                    </h3>
                  )}
                  <div className="space-y-3">
                    {cat.items.map((item, i) => {
                      const key = `${cat.title}-${i}`;
                      const isOpen = openItems.has(key);
                      return (
                        <div
                          key={key}
                          className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden transition-all duration-200 hover:border-brand-500/20"
                        >
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                          >
                            <span className="font-display font-semibold text-body-lg text-surface-900 dark:text-surface-100">
                              {item.q}
                            </span>
                            <ChevronDown
                              size={20}
                              className={cn(
                                'flex-shrink-0 text-surface-400 transition-transform duration-200',
                                isOpen && 'rotate-180 text-brand-500',
                              )}
                            />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="px-6 pb-5 text-body-md text-surface-500 dark:text-surface-400 leading-relaxed">
                                  {item.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
        <Container size="narrow">
          <div className="text-center">
            <h2 className="font-display font-bold text-heading-lg text-surface-900 dark:text-surface-50">
              Still have questions?
            </h2>
            <p className="mt-2 text-body-lg text-surface-500 dark:text-surface-400">
              Our team is happy to help. Reach out anytime.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button size="lg">
                  <MessageSquare size={18} />
                  Contact Us
                </Button>
              </Link>
              <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}>
                <Button variant="outline" size="lg">
                  <Phone size={18} />
                  {siteConfig.contact.phone}
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
