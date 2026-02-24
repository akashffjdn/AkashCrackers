import { Container } from '@/components/atoms/Container.tsx';
import { TrustBadge } from '@/components/molecules/TrustBadge.tsx';
import { siteConfig } from '@/config/site.ts';

export function TrustBar() {
  return (
    <section className="py-8 bg-white dark:bg-surface-900 border-y border-surface-200 dark:border-surface-800">
      <Container size="wide">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {siteConfig.trustBadges.map((badge, i) => (
            <TrustBadge key={badge.label} label={badge.label} value={badge.value} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
