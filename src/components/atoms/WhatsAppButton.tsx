import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site.ts';

const HIDDEN_PATHS = ['/checkout', '/order-confirmation', '/login', '/signup', '/safety'];

export function WhatsAppButton() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  // Delay entry by 1.5s after mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Hide on checkout, order confirmation, login, admin routes
  const hidden =
    HIDDEN_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/admin');

  if (hidden || !visible) return null;

  // Build WhatsApp URL with pre-filled message
  const message = encodeURIComponent(`Hi ${siteConfig.name} team! I have a question.`);
  const href = `${siteConfig.social.whatsapp}?text=${message}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-5 right-5 z-[1000] lg:bottom-6 lg:right-6"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
      >
        {/* Tooltip — desktop only */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden lg:block whitespace-nowrap"
            >
              <div className="px-3 py-2 rounded-lg bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-body-sm font-medium shadow-lg">
                Chat with us on WhatsApp
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp, opens WhatsApp"
          className="group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </motion.div>
    </AnimatePresence>
  );
}
