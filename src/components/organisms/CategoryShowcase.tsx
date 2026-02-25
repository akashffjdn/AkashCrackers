import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { SectionHeading } from '@/components/atoms/SectionHeading.tsx';
import { cn } from '@/lib/utils.ts';

const showcaseCategories = [
  {
    title: 'Aerial Shells',
    description: 'Sky-painting masterpieces',
    image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&q=80',
    href: '/shop?category=aerial',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    title: 'Sparklers',
    description: 'Elegant hand-held magic',
    image: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=600&q=80',
    href: '/shop?category=sparklers',
    span: '',
  },
  {
    title: 'Rockets',
    description: 'Soaring performances',
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&q=80',
    href: '/shop?category=rockets',
    span: '',
  },
  {
    title: 'Combo Packs',
    description: 'Complete celebration kits',
    image: 'https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=600&q=80',
    href: '/shop?category=combo-packs',
    span: 'lg:col-span-2',
  },
];

export function CategoryShowcase() {
  return (
    <section className="section-padding bg-white dark:bg-surface-900">
      <Container size="wide">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find Your Perfect Fireworks"
          subtitle="Explore our curated collection across every category"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-[240px] lg:auto-rows-[200px]">
          {showcaseCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={cn('relative', category.span)}
            >
              <Link
                to={category.href}
                className="group block relative h-full rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={400}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="font-display font-bold text-heading-md lg:text-heading-lg text-white">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-body-sm text-white/70">{category.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-brand-400 text-body-sm font-medium">
                    <span>Explore</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
