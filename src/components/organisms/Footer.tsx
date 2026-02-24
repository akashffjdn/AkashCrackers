import { Link } from 'react-router-dom';
import { Container } from '@/components/atoms/Container.tsx';
import { siteConfig } from '@/config/site.ts';
import { footerLinks } from '@/config/navigation.ts';
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import logoImg from '@/assets/images/logo_crackers.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-100 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
      {/* Main Footer */}
      <Container size="wide">
        <div className="py-10 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt={siteConfig.name} className="w-8 h-8 rounded-lg object-contain" />
                <span className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">
                  {siteConfig.name}
                </span>
              </Link>
              <p className="text-body-sm text-surface-500 dark:text-surface-400 mb-6 max-w-xs">
                {siteConfig.tagline}. Trusted by {siteConfig.trustBadges[1].value} customers across India.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Instagram, href: siteConfig.social.instagram },
                  { icon: Facebook, href: siteConfig.social.facebook },
                  { icon: Youtube, href: siteConfig.social.youtube },
                ].map(({ icon: Icon, href }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-brand-500 hover:text-surface-950 transition-all duration-200"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {[
              { title: 'Shop', links: footerLinks.shop },
              { title: 'Occasions', links: footerLinks.occasions },
              { title: 'Company', links: footerLinks.company },
              { title: 'Support', links: footerLinks.support },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-50 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-body-sm text-surface-500 dark:text-surface-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Bar */}
          <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {[
                { icon: Phone, text: siteConfig.contact.phone },
                { icon: Mail, text: siteConfig.contact.email },
                { icon: MapPin, text: siteConfig.contact.address },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-body-sm text-surface-500 dark:text-surface-400">
                  <Icon size={16} className="text-brand-500 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-surface-200 dark:border-surface-800">
        <Container size="wide">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <p className="text-caption text-surface-400">
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-caption text-surface-400">BIS Certified</span>
              <span className="text-caption text-surface-400">|</span>
              <span className="text-caption text-surface-400">Safe & Secure Payments</span>
              <span className="text-caption text-surface-400">|</span>
              <span className="text-caption text-surface-400">Pan India Delivery</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
