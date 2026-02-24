import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';

interface PolicyLayoutProps {
  title: string;
  eyebrow: string;
  lastUpdated: string;
  children: ReactNode;
}

export function PolicyLayout({ title, eyebrow, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="pt-16 lg:pt-18 min-h-screen">
      {/* Header with inline breadcrumbs */}
      <section className="pt-8 pb-12 lg:pt-10 lg:pb-16 bg-white dark:bg-surface-900">
        <Container size="narrow">
          <nav className="flex items-center gap-2 mb-8 text-body-sm text-surface-400">
            <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-surface-600 dark:text-surface-300">{title}</span>
          </nav>
          <div className="text-center">
            <span className="inline-block mb-3 text-label font-bold uppercase tracking-widest text-brand-500">{eyebrow}</span>
            <h1 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50">{title}</h1>
            <p className="mt-3 text-body-sm text-surface-400">Last updated: {lastUpdated}</p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="pb-16 lg:pb-24 bg-surface-50 dark:bg-surface-950">
        <Container size="narrow">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-card dark:shadow-card-dark">
            {children}
          </div>
        </Container>
      </section>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-4">{title}</h2>
      <div className="space-y-3 text-body-md text-surface-600 dark:text-surface-400 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
