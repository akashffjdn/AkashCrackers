import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, Eye, Users, Flame,
  Droplets, MapPin, Phone, Heart, CheckCircle, XCircle,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { SEO } from '@/components/SEO.tsx';
import { siteConfig } from '@/config/site.ts';
import { cn } from '@/lib/utils.ts';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const safetyDos = [
  'Read all instructions on the label before use',
  'Light fireworks one at a time and move away quickly',
  'Keep a bucket of water or fire extinguisher nearby',
  'Supervise children at all times — even with "safe" products',
  'Wear cotton clothing — avoid synthetic fabrics',
  'Store fireworks in a cool, dry place away from heat',
  'Maintain a safe distance as specified on the product',
  'Use fireworks outdoors in open areas only',
];

const safetyDonts = [
  'Never relight a firework that didn\'t go off — wait 20 minutes then soak in water',
  'Never point or throw fireworks at people or animals',
  'Don\'t carry fireworks in your pockets',
  'Don\'t use fireworks near flammable materials or dry vegetation',
  'Never give fireworks to young children without supervision',
  'Don\'t experiment with or modify firework products',
  'Don\'t light fireworks indoors or in enclosed spaces',
  'Never lean over a firework while lighting it',
];

const emergencySteps = [
  { icon: Droplets, title: 'Minor Burns', desc: 'Run cool (not cold) water over the burn for at least 10 minutes. Cover with a sterile, non-stick bandage. Do not apply ice, butter, or ointments.' },
  { icon: Eye, title: 'Eye Injury', desc: 'Do NOT rub or touch the eye. Cover with a rigid shield (paper cup) and seek emergency medical attention immediately.' },
  { icon: Flame, title: 'Fire Emergency', desc: 'Call fire services (101) immediately. Use a fire extinguisher or water if safely possible. Evacuate the area and account for all persons.' },
  { icon: Phone, title: 'Serious Injury', desc: 'Call emergency services (112) immediately. Do not move the injured person unless there is immediate danger. Apply pressure to any bleeding wounds.' },
];

export function SafetyPage() {
  return (
    <div className="pt-16 lg:pt-18 min-h-screen">
      <SEO
        title="Fireworks Safety Guidelines — Do's, Don'ts & First Aid"
        description="Essential fireworks safety guidelines from Akash Crackers. Learn proper handling, storage, safety ratings, emergency first aid, and important dos and don'ts."
        canonical="/safety"
      />
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1920&q=30')] bg-cover bg-center opacity-10" />
        <Container size="narrow" className="relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-display-sm sm:text-display-md text-white">
              Safety Guidelines
            </h1>
            <p className="mt-4 text-body-lg text-white/70 max-w-xl mx-auto">
              Your safety is our top priority. Please read these guidelines carefully before using any fireworks.
              Every product from {siteConfig.name} is BIS certified and tested for quality.
            </p>
          </div>
        </Container>
      </section>

      {/* Do's and Don'ts */}
      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Do's */}
            <motion.div {...fadeUp} className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle size={22} className="text-emerald-500" />
                </div>
                <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">Safety Do's</h2>
              </div>
              <div className="space-y-3">
                {safetyDos.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-body-md text-surface-700 dark:text-surface-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Don'ts */}
            <motion.div {...fadeUp} className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle size={22} className="text-red-500" />
                </div>
                <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">Safety Don'ts</h2>
              </div>
              <div className="space-y-3">
                {safetyDonts.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-body-md text-surface-700 dark:text-surface-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Emergency */}
      <section className="section-padding bg-white dark:bg-surface-900">
        <Container size="wide">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-red-500">Be Prepared</span>
            <h2 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">Emergency First Aid</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencySteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-red-500" />
                  </div>
                  <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">{step.title}</h3>
                  <p className="mt-2 text-body-sm text-surface-500 dark:text-surface-400">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Safety Ratings */}
      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="narrow">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display font-bold text-heading-lg text-surface-900 dark:text-surface-50">Understanding Safety Ratings</h2>
          </motion.div>
          <div className="space-y-4">
            {[
              { level: 'Family Safe', color: 'border-emerald-500/30 bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: Heart, desc: 'Suitable for children under adult supervision. Low noise, minimal smoke. Includes sparklers, smoke balls, pop-pops, and gentle fountains.' },
              { level: 'Standard', color: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Users, desc: 'For adults and teens. Medium noise and effects. Includes rockets, Roman candles, and multi-shot cakes. Keep safe distance as labeled.' },
              { level: 'Professional', color: 'border-red-500/30 bg-red-500/5', badge: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: AlertTriangle, desc: 'For experienced users and licensed professionals only. High-power aerial shells and display-grade products. Requires open space and safety perimeter.' },
            ].map((rating) => {
              const Icon = rating.icon;
              return (
                <div key={rating.level} className={cn('flex items-start gap-4 p-6 rounded-2xl border', rating.color)}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', rating.badge)}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">{rating.level}</h3>
                    <p className="mt-1 text-body-md text-surface-600 dark:text-surface-400">{rating.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Emergency Numbers */}
      <section className="py-12 bg-red-600">
        <Container size="wide">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-12 text-white">
            <div className="flex items-center gap-3">
              <Phone size={20} />
              <div>
                <p className="text-body-sm text-white/70">Emergency</p>
                <p className="font-display font-bold text-heading-sm">112</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <Flame size={20} />
              <div>
                <p className="text-body-sm text-white/70">Fire Services</p>
                <p className="font-display font-bold text-heading-sm">101</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <MapPin size={20} />
              <div>
                <p className="text-body-sm text-white/70">Ambulance</p>
                <p className="font-display font-bold text-heading-sm">108</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
