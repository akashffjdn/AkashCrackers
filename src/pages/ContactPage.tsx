import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Clock, Send, MessageSquare,
  ChevronRight, CheckCircle, Instagram, Facebook, Youtube,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { SEO } from '@/components/SEO.tsx';
import { localBusinessSchema } from '@/lib/seo.ts';
import { siteConfig } from '@/config/site.ts';
import { cn } from '@/lib/utils.ts';

const contactMethods = [
  {
    icon: Phone,
    label: 'Call Us',
    value: siteConfig.contact.phone,
    desc: 'Mon-Sat, 9 AM - 8 PM IST',
    href: `tel:${siteConfig.contact.phone.replace(/\s/g, '')}`,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: siteConfig.contact.email,
    desc: 'We reply within 24 hours',
    href: `mailto:${siteConfig.contact.email}`,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: MessageSquare,
    label: 'WhatsApp',
    value: 'Chat with us',
    desc: 'Instant support on WhatsApp',
    href: siteConfig.social.whatsapp,
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: siteConfig.contact.address,
    desc: 'Open during festival season',
    href: '#',
    color: 'bg-brand-500/10 text-brand-500',
  },
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

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

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
        title="Contact Us — Akash Crackers Support & Inquiries"
        description="Get in touch with Akash Crackers. Call +91 98765 43210, email hello@akashcrackers.com, or visit us in Sivakasi, Tamil Nadu. Mon-Sat 9AM-8PM IST."
        canonical="/contact"
        jsonLd={localBusinessSchema()}
      />
      {/* Header */}
      <section className="pt-8 pb-10 lg:pt-10 lg:pb-14 bg-white dark:bg-surface-900">
        <Container size="wide">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">Get in Touch</span>
            <h1 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50">
              We'd Love to Hear From You
            </h1>
            <p className="mt-4 text-body-lg text-surface-500 dark:text-surface-400">
              Whether you need help choosing the right fireworks, have a bulk inquiry, or just want to say hello — we're here.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Cards */}
      <section className="py-10 bg-surface-50 dark:bg-surface-950">
        <Container size="wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={method.label}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-500/30 hover:shadow-glow transition-all duration-300"
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', method.color)}>
                    <Icon size={22} />
                  </div>
                  <p className="text-label font-bold uppercase tracking-wider text-surface-400 mb-1">{method.label}</p>
                  <p className="font-display font-semibold text-body-lg text-surface-900 dark:text-surface-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    {method.value}
                  </p>
                  <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">{method.desc}</p>
                </motion.a>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Form + Social */}
      <section className="section-padding bg-surface-50 dark:bg-surface-950">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-surface-200 dark:border-surface-800">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">Message Sent!</h3>
                    <p className="mt-2 text-body-md text-surface-500">We'll get back to you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-4 text-body-sm text-brand-500 hover:underline">
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
                      Send Us a Message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className={inputClass} />
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone number" className={inputClass} />
                        <select name="subject" value={form.subject} onChange={handleChange} required className={inputClass}>
                          <option value="">Select subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="bulk">Bulk Order Inquiry</option>
                          <option value="support">Order Support</option>
                          <option value="safety">Safety Question</option>
                          <option value="partnership">Business Partnership</option>
                        </select>
                      </div>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Your message..."
                        required
                        rows={5}
                        className={cn(inputClass, 'resize-none')}
                      />
                      <Button type="submit" size="lg" fullWidth>
                        <Send size={18} />
                        Send Message
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hours */}
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={20} className="text-brand-500" />
                  <h3 className="font-display font-semibold text-heading-sm text-surface-900 dark:text-surface-50">Business Hours</h3>
                </div>
                <div className="space-y-2 text-body-sm">
                  {[
                    { day: 'Monday - Saturday', time: '9:00 AM - 8:00 PM' },
                    { day: 'Sunday', time: '10:00 AM - 6:00 PM' },
                    { day: 'Festival Season', time: '8:00 AM - 10:00 PM' },
                  ].map((h) => (
                    <div key={h.day} className="flex justify-between">
                      <span className="text-surface-500 dark:text-surface-400">{h.day}</span>
                      <span className="font-medium text-surface-900 dark:text-surface-100">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <h3 className="font-display font-semibold text-heading-sm text-surface-900 dark:text-surface-50 mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: Instagram, href: siteConfig.social.instagram, label: 'Instagram' },
                    { icon: Facebook, href: siteConfig.social.facebook, label: 'Facebook' },
                    { icon: Youtube, href: siteConfig.social.youtube, label: 'YouTube' },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-brand-500 hover:text-surface-950 transition-all duration-200"
                      aria-label={label}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20">
                <h3 className="font-display font-semibold text-heading-sm text-surface-900 dark:text-surface-50 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Track Your Order', href: '/track-order' },
                    { label: 'Bulk Order Inquiry', href: '/bulk-orders' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Safety Guidelines', href: '/safety' },
                  ].map((link) => (
                    <Link key={link.href} to={link.href} className="flex items-center gap-2 text-body-sm text-brand-600 dark:text-brand-400 hover:underline">
                      <ChevronRight size={14} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
