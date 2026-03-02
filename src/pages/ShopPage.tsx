import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, LayoutList } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { SectionHeading } from '@/components/atoms/SectionHeading.tsx';
import { CategoryChip } from '@/components/molecules/CategoryChip.tsx';
import { ProductCard } from '@/components/molecules/ProductCard.tsx';
import { SEO } from '@/components/SEO.tsx';
import { getProducts, getCategories } from '@/services/products.ts';
import type { CategoryItem } from '@/services/products.ts';
import { cn } from '@/lib/utils.ts';
import type { Product } from '@/types/index.ts';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') ?? 'all';
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([productsRes, categoriesRes]) => {
        if (cancelled) return;
        setProducts(productsRes.data);
        const allCount = productsRes.total || productsRes.data.length;
        const cats: { id: string; label: string; count: number }[] = [
          { id: 'all', label: 'All Products', count: allCount },
          ...categoriesRes.map((c: CategoryItem) => ({
            id: c.slug,
            label: c.name,
            count: c.productCount,
          })),
        ];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    if (id === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', id);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    let result = activeCategory === 'all'
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, activeCategory, sortBy]);

  return (
    <div className="pt-16 lg:pt-18">
      <SEO
        title="Shop Premium Fireworks Online — Aerial Shells, Rockets, Sparklers"
        description="Browse our complete collection of BIS-certified fireworks. Aerial shells, rockets, sparklers, fountains, Roman candles, and combo packs with free shipping above ₹999."
        canonical="/shop"
      />
      {/* Page Header */}
      <section className="pt-8 pb-10 lg:pt-10 lg:pb-14 bg-white dark:bg-surface-900">
        <Container size="wide">
          <SectionHeading
            eyebrow="Our Collection"
            title="Premium Fireworks"
            subtitle="Explore our complete range of hand-crafted, BIS-certified fireworks for every occasion"
          />
        </Container>
      </section>

      <section className="py-10 lg:py-14 bg-surface-50 dark:bg-surface-950">
        <Container size="wide">
          {/* Filters Bar */}
          <div className="mb-8 space-y-4">
            {/* Category Chips */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  label={cat.label}
                  count={cat.count}
                  isActive={activeCategory === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                />
              ))}
            </div>

            {/* Sort + View */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-surface-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-body-sm font-medium bg-transparent text-surface-700 dark:text-surface-300 border-none focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center gap-1 bg-surface-200 dark:bg-surface-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                      : 'text-surface-500',
                  )}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list'
                      ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                      : 'text-surface-500',
                  )}
                >
                  <LayoutList size={16} />
                </button>
              </div>

              <span className="text-body-sm text-surface-500">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <p className="font-display font-semibold text-heading-md text-surface-500">
                No products found
              </p>
              <p className="mt-2 text-body-md text-surface-400">
                Try a different category or filter
              </p>
            </motion.div>
          ) : (
            <div
              className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2',
              )}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
