import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Award, Shield, Users, Flame, MapPin,
  Heart, Target, ArrowRight, Sparkles, Factory, Truck,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { cn } from '@/lib/utils.ts';

const milestones = [
  { year: '1999', title: 'The Spark Begins', desc: 'Founded in Sivakasi by the Akash family with a small workshop and a passion for pyrotechnic artistry.' },
  { year: '2005', title: 'BIS Certification', desc: 'Earned the Bureau of Indian Standards certification — our commitment to quality and safety recognized nationally.' },
  { year: '2012', title: 'Pan-India Expansion', desc: 'Expanded operations to serve all 28 states with a dedicated logistics network and regional warehouses.' },
  { year: '2018', title: '10,000+ Products Crafted', desc: 'Crossed 10,000 unique product formulations. Introduced low-noise and eco-friendly product lines.' },
  { year: '2022', title: 'Digital First', desc: 'Launched our premium eCommerce platform, making world-class fireworks accessible to every doorstep.' },
  { year: '2026', title: '50,000+ Happy Customers', desc: 'Proudly serving over 50,000 families, weddings, and professional events every celebration season.' },
];

const values = [
  { icon: Shield, title: 'Safety First', desc: 'Every product passes 12-point quality inspection. BIS certified across our entire range.' },
  { icon: Award, title: 'Premium Quality', desc: 'Hand-crafted in Sivakasi using time-tested formulations refined over 25+ years.' },
  { icon: Heart, title: 'Customer Obsession', desc: 'Dedicated support team available through the season. Your celebration is our priority.' },
  { icon: Target, title: 'Innovation', desc: 'Continuously developing low-noise, low-smoke, and eco-conscious fireworks for modern celebrations.' },
];

const stats = [
  { value: '25+', label: 'Years of Heritage' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '500+', label: 'Premium Products' },
  { value: '28', label: 'States Served' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

export function AboutPage() {
  return (
    <div className="pt-16 lg:pt-18">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=1920&q=80"
            alt="Fireworks craftsmanship"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <Container size="wide" className="relative z-10 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-sm mb-6">
              <Sparkles size={16} className="text-brand-400" />
              <span className="text-body-sm font-medium text-brand-300">Our Story</span>
            </span>
            <h1 className="font-display font-black text-display-md sm:text-display-lg text-white">
              Crafting <span className="text-gradient-brand">Celebrations</span> Since 1999
            </h1>
            <p className="mt-6 text-body-lg text-white/70 max-w-xl">
              From a small Sivakasi workshop to India's most trusted premium fireworks brand.
              Every spark carries 25 years of passion, precision, and pyrotechnic artistry.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-surface-900 border-y border-surface-200 dark:border-surface-800">
        <Container size="wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-surface-200 dark:divide-surface-800">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center py-8 lg:py-10"
              >
                <span className="font-display font-bold text-display-sm text-brand-500">{stat.value}</span>
                <span className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Mission */}
      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="narrow">
          <motion.div {...fadeUp} className="text-center">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">Our Mission</span>
            <h2 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50 text-balance">
              To make every celebration unforgettable with fireworks that are safe, stunning, and accessible to all.
            </h2>
            <p className="mt-6 text-body-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              We believe celebrations are the moments that define our lives. Whether it's a child's first Diwali,
              a dream wedding, or a community gathering — the right fireworks transform an event into a memory that lasts forever.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Values */}
      <section className="section-padding bg-white dark:bg-surface-900">
        <Container size="wide">
          <motion.div {...fadeUp} className="text-center mb-12 lg:mb-16">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">What Drives Us</span>
            <h2 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50">Our Core Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-6 lg:p-8 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 hover:border-brand-500/30 hover:shadow-glow transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                    <Icon size={24} className="text-brand-500" />
                  </div>
                  <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">{value.title}</h3>
                  <p className="mt-2 text-body-sm text-surface-500 dark:text-surface-400">{value.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="narrow">
          <motion.div {...fadeUp} className="text-center mb-12 lg:mb-16">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">Our Journey</span>
            <h2 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50">25 Years of Brilliance</h2>
          </motion.div>
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-800 lg:-translate-x-px" />
            <div className="space-y-10 lg:space-y-12">
              {milestones.map((ms, i) => (
                <motion.div
                  key={ms.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className={cn(
                    'relative flex items-start gap-6',
                    'lg:items-center',
                    i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse',
                  )}
                >
                  {/* Dot */}
                  <div className="absolute left-6 lg:left-1/2 w-3 h-3 rounded-full bg-brand-500 -translate-x-1.5 mt-2 lg:mt-0 z-10 shadow-glow" />
                  {/* Content */}
                  <div className={cn('flex-1 ml-14 lg:ml-0', i % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12')}>
                    <span className="text-label font-bold uppercase tracking-widest text-brand-500">{ms.year}</span>
                    <h3 className="mt-1 font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">{ms.title}</h3>
                    <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">{ms.desc}</p>
                  </div>
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Factory / Craft Section */}
      <section className="section-padding bg-white dark:bg-surface-900">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80"
                  alt="Our craftsmanship"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">The Craft</span>
              <h2 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">
                Handcrafted in the Fireworks Capital
              </h2>
              <p className="mt-4 text-body-lg text-surface-500 dark:text-surface-400">
                Sivakasi, Tamil Nadu — the fireworks capital of India. Our manufacturing facility combines generations
                of artisan knowledge with modern safety standards and quality control processes.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Factory, text: '50,000 sq ft facility' },
                  { icon: Users, text: '200+ skilled artisans' },
                  { icon: Shield, text: '12-point quality checks' },
                  { icon: Flame, text: 'Eco-friendly formulations' },
                  { icon: Truck, text: 'Climate-controlled storage' },
                  { icon: MapPin, text: 'Sivakasi, Tamil Nadu' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={18} className="text-brand-500 flex-shrink-0" />
                    <span className="text-body-sm text-surface-700 dark:text-surface-300">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-950 to-black" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1920&q=30')] bg-cover bg-center opacity-10" />
        <Container size="narrow">
          <motion.div {...fadeUp} className="relative py-20 lg:py-28 text-center">
            <h2 className="font-display font-bold text-display-sm sm:text-display-md text-white text-balance">
              Ready to Create Unforgettable Moments?
            </h2>
            <p className="mt-4 text-body-lg text-white/60 max-w-xl mx-auto">
              Browse our premium collection or reach out for custom event packages.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop">
                <Button size="xl" className="group">
                  Shop Now
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="xl" className="border-white/30 text-white hover:border-brand-400 hover:text-brand-400">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
