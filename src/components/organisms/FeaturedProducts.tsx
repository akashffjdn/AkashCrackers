import { Container } from '@/components/atoms/Container.tsx';
import { SectionHeading } from '@/components/atoms/SectionHeading.tsx';
import { ProductCard } from '@/components/molecules/ProductCard.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { featuredProducts } from '@/data/products.ts';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function FeaturedProducts() {
  return (
    <section className="section-padding bg-surface-50 dark:bg-surface-950">
      <Container size="wide">
        <SectionHeading
          eyebrow="Curated Selection"
          title="Featured Products"
          subtitle="Hand-picked premium fireworks for unforgettable celebrations"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/shop">
            <Button variant="outline" size="lg" className="group">
              View All Products
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
