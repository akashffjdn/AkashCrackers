import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge.tsx';
import { StarRating } from '@/components/atoms/StarRating.tsx';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils.ts';
import { useCartStore } from '@/store/cart.ts';
import type { Product } from '@/types/index.ts';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    openCart();
  };

  const discount = product.originalPrice
    ? calculateDiscount(product.price, product.originalPrice)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group block"
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'bg-white dark:bg-surface-900',
            'border border-surface-200/60 dark:border-surface-800/60',
            'shadow-card dark:shadow-card-dark',
            'hover:shadow-card-hover dark:hover:shadow-card-dark-hover',
            'transition-all duration-300 ease-out',
          )}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-100 dark:bg-surface-850">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges */}
            {product.badge && (
              <div className="absolute top-3 left-3">
                <Badge type={product.badge} />
              </div>
            )}

            {/* Discount Badge */}
            {discount && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-600 text-white text-label font-bold">
                  -{discount}%
                </span>
              </div>
            )}

            {/* Hover Overlay */}
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center gap-3',
                'bg-surface-950/0 group-hover:bg-surface-950/40',
                'transition-all duration-300',
                'opacity-0 group-hover:opacity-100',
              )}
            >
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-500 text-surface-950 hover:bg-brand-400 transition-all duration-200 translate-y-4 group-hover:translate-y-0 shadow-lg"
                aria-label="Add to cart"
              >
                <ShoppingCart size={20} />
              </button>
              <span
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 dark:bg-surface-800/90 text-surface-700 dark:text-surface-200 transition-all duration-200 translate-y-4 group-hover:translate-y-0 delay-75 shadow-lg"
              >
                <Eye size={20} />
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 lg:p-5">
            {/* Category */}
            <p className="text-label font-semibold uppercase tracking-wider text-brand-500 mb-1.5">
              {product.category.replace('-', ' ')}
            </p>

            {/* Name */}
            <h3 className="font-display font-semibold text-heading-sm text-surface-900 dark:text-surface-50 line-clamp-1 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            <p className="mt-1.5 text-body-sm text-surface-500 dark:text-surface-400 line-clamp-2">
              {product.shortDescription}
            </p>

            {/* Rating */}
            <div className="mt-3">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>

            {/* Price + CTA */}
            <div className="mt-4 flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-heading-md text-brand-600 dark:text-brand-400">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-body-sm text-surface-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl',
                  'bg-surface-900 dark:bg-surface-100 text-surface-50 dark:text-surface-900',
                  'hover:bg-brand-500 hover:text-surface-950',
                  'text-body-sm font-medium transition-all duration-200',
                )}
              >
                <ShoppingCart size={15} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
