import { HeroSection } from '@/components/organisms/HeroSection.tsx';
import { TrustBar } from '@/components/organisms/TrustBar.tsx';
import { CategoryShowcase } from '@/components/organisms/CategoryShowcase.tsx';
import { FeaturedProducts } from '@/components/organisms/FeaturedProducts.tsx';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA.tsx';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategoryShowcase />
      <FeaturedProducts />
      <NewsletterCTA />
    </>
  );
}
