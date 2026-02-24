import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw,
  ChevronRight, Star, Volume2, VolumeX, AlertTriangle,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { Badge } from '@/components/atoms/Badge.tsx';
import { StarRating } from '@/components/atoms/StarRating.tsx';
import { QuantitySelector } from '@/components/atoms/QuantitySelector.tsx';
import { ProductCard } from '@/components/molecules/ProductCard.tsx';
import { useCartStore } from '@/store/cart.ts';
import { products } from '@/data/products.ts';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils.ts';

const noiseLevelConfig = {
  low: { icon: VolumeX, label: 'Low Noise', color: 'text-emerald-500' },
  medium: { icon: Volume2, label: 'Medium', color: 'text-amber-500' },
  high: { icon: Volume2, label: 'High', color: 'text-red-500' },
};

const safetyConfig = {
  family: { label: 'Family Safe', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  standard: { label: 'Standard', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  professional: { label: 'Professional', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">
            Product Not Found
          </h1>
          <p className="mt-4 text-body-lg text-surface-500">
            The product you're looking for doesn't exist.
          </p>
          <Link to="/shop" className="mt-6 inline-block">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
  };

  const discount = product.originalPrice
    ? calculateDiscount(product.price, product.originalPrice)
    : null;

  const noise = noiseLevelConfig[product.noiseLevel];
  const safety = safetyConfig[product.safetyRating];
  const NoiseIcon = noise.icon;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pt-20 lg:pt-24">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <Container size="wide">
          <nav className="flex items-center gap-2 py-4 text-body-sm text-surface-500">
            <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-brand-500 transition-colors">Shop</Link>
            <ChevronRight size={14} />
            <Link to={`/shop?category=${product.category}`} className="hover:text-brand-500 transition-colors capitalize">
              {product.category.replace('-', ' ')}
            </Link>
            <ChevronRight size={14} />
            <span className="text-surface-900 dark:text-surface-100 font-medium">{product.name}</span>
          </nav>
        </Container>
      </div>

      <Container size="wide">
        <div className="py-8 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-850">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.badge && (
                  <div className="absolute top-4 left-4">
                    <Badge type={product.badge} />
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                        selectedImage === i
                          ? 'border-brand-500 shadow-glow'
                          : 'border-surface-200 dark:border-surface-700 opacity-60 hover:opacity-100',
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-label font-bold uppercase tracking-widest text-brand-500 mb-2">
                {product.category.replace('-', ' ')}
              </p>

              <h1 className="font-display font-bold text-display-sm lg:text-display-md text-surface-900 dark:text-surface-50">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-4">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display font-bold text-display-sm text-brand-600 dark:text-brand-400">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-heading-sm text-surface-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-body-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="mt-6 text-body-lg text-surface-600 dark:text-surface-400 leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-3">
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-body-sm font-medium', safety.color)}>
                  <Shield size={14} />
                  {safety.label}
                </span>
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-body-sm font-medium', noise.color)}>
                  <NoiseIcon size={14} />
                  {noise.label} Noise
                </span>
                {product.duration && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-body-sm font-medium text-surface-600 dark:text-surface-400">
                    <Star size={14} />
                    {product.duration}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-body-sm text-surface-600 dark:text-surface-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <QuantitySelector quantity={quantity} onChange={setQuantity} />
                  <span className="text-body-sm text-surface-500">
                    {product.inStock ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        In Stock ({product.stockCount} left)
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">Out of Stock</span>
                    )}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    fullWidth
                    disabled={!product.inStock}
                    className="flex-1"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart — {formatPrice(product.price * quantity)}
                  </Button>
                  <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-red-500 hover:border-red-500/30 transition-colors">
                    <Heart size={20} />
                  </button>
                  <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-brand-500 hover:border-brand-500/30 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-100 dark:bg-surface-850">
                {[
                  { icon: Truck, label: 'Free Shipping', desc: 'On orders above ₹999' },
                  { icon: Shield, label: 'BIS Certified', desc: '100% quality assured' },
                  { icon: RotateCcw, label: 'Easy Returns', desc: '7-day return policy' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon size={20} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-body-sm font-semibold text-surface-900 dark:text-surface-100">{label}</p>
                      <p className="text-caption text-surface-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety Warning */}
              {product.safetyRating === 'professional' && (
                <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-body-sm text-amber-700 dark:text-amber-400">
                    Professional-grade product. Adult supervision required. Please follow all safety guidelines.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-surface-50 dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800">
          <Container size="wide">
            <h2 className="font-display font-bold text-heading-lg text-surface-900 dark:text-surface-50 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
