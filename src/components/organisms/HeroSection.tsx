import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/atoms/Button.tsx';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1920&q=80"
          srcSet="https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=640&q=75 640w, https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1024&q=80 1024w, https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1920&q=80 1920w"
          sizes="100vw"
          alt="Fireworks display"
          width={1920}
          height={1280}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Animated particles overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-brand-400/60"
            initial={{
              x: `${20 + i * 15}%`,
              y: '100%',
              opacity: 0,
            }}
            animate={{
              y: '-10%',
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-sm mb-8"
        >
          <Sparkles size={16} className="text-brand-400" />
          <span className="text-body-sm font-medium text-brand-300">
            Diwali 2026 Collection Now Live
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display font-black text-display-md sm:text-display-lg lg:text-display-xl text-white leading-tight"
        >
          Light Up the{' '}
          <span className="text-gradient-brand">Night Sky</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-body-lg sm:text-heading-sm text-white/70 max-w-2xl mx-auto text-balance"
        >
          Premium-crafted fireworks for celebrations that deserve perfection.
          From elegant sparklers to breathtaking aerial shows.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/shop">
            <Button size="xl" className="group">
              Shop Collection
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/shop?occasion=diwali">
            <Button variant="outline" size="xl" className="border-white/30 text-white hover:border-brand-400 hover:text-brand-400">
              Diwali Specials
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '50K+', label: 'Happy Customers' },
            { value: '500+', label: 'Premium Products' },
            { value: '25+', label: 'Years of Trust' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-bold text-heading-md sm:text-heading-lg text-brand-400">
                {stat.value}
              </p>
              <p className="mt-1 text-caption sm:text-body-sm text-white/50">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-2.5 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
