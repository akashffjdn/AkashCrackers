import { useMemo } from 'react';
import { HeroSection } from '@/components/organisms/HeroSection.tsx';
import { TrustBar } from '@/components/organisms/TrustBar.tsx';
import { CategoryShowcase } from '@/components/organisms/CategoryShowcase.tsx';
import { FeaturedProducts } from '@/components/organisms/FeaturedProducts.tsx';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA.tsx';
import { SEO } from '@/components/SEO.tsx';
import { organizationSchema, websiteSchema } from '@/lib/seo.ts';

export function HomePage() {
  const jsonLd = useMemo(() => [organizationSchema(), websiteSchema()], []);

  return (
    <>
      <SEO
        description="Akash Crackers — Premium fireworks for every celebration. Shop aerial shells, rockets, sparklers, and professional-grade fireworks with nationwide delivery from Sivakasi."
        canonical="/"
        jsonLd={jsonLd}
      />
      <HeroSection />
      <TrustBar />
      <CategoryShowcase />
      <FeaturedProducts />
      <NewsletterCTA />
    </>
  );
}
