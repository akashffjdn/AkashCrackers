import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, ArrowRight,
  Zap, Filter, ChevronDown, Volume2, VolumeX, X,
  ArrowUpDown, Award, Crown, Check,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { SEO } from '@/components/SEO.tsx';
import { useCartStore } from '@/store/cart.ts';
import { getProducts, getCategories } from '@/services/products.ts';
import type { CategoryItem } from '@/services/products.ts';
import { formatPrice, cn } from '@/lib/utils.ts';
import type { Product } from '@/types/index.ts';

type SortOption = 'bestselling' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'name' | 'discount';
type NoiseFilter = 'low' | 'medium' | 'high';
type PriceRange = 'under-500' | '500-1500' | '1500-5000' | '5000-plus';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Biggest Savings' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name: A → Z' },
];

const noiseOptions: { value: NoiseFilter; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: 'under-500', label: 'Under ₹500' },
  { value: '500-1500', label: '₹500 – ₹1,500' },
  { value: '1500-5000', label: '₹1,500 – ₹5,000' },
  { value: '5000-plus', label: '₹5,000+' },
];

interface QuickOrderItem {
  product: Product;
  quantity: number;
}

function getDiscount(p: Product) {
  if (!p.originalPrice) return 0;
  return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
}

function getStockStatus(p: Product) {
  if (!p.inStock) return { label: 'Out of Stock', color: 'text-red-500', dot: 'bg-red-500' };
  if (p.stockCount !== undefined && p.stockCount < 20) return { label: `${p.stockCount} left`, color: 'text-amber-500', dot: 'bg-amber-500' };
  return { label: 'In Stock', color: 'text-emerald-500', dot: 'bg-emerald-500' };
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export function QuickOrderPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('bestselling');
  const [noiseFilters, setNoiseFilters] = useState<Set<NoiseFilter>>(new Set());
  const [priceFilter, setPriceFilter] = useState<PriceRange | null>(null);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [orderItems, setOrderItems] = useState<Map<string, QuickOrderItem>>(new Map());
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef, () => setShowFilters(false));
  useClickOutside(sortRef, () => setShowSort(false));

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (noiseFilters.size > 0) count++;
    if (priceFilter) count++;
    if (onSaleOnly) count++;
    return count;
  }, [noiseFilters, priceFilter, onSaleOnly]);

  const filteredProducts = useMemo(() => {
    let result = activeCategory === 'all'
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      );
    }

    if (noiseFilters.size > 0) {
      result = result.filter((p) => noiseFilters.has(p.noiseLevel));
    }

    if (priceFilter) {
      result = result.filter((p) => {
        switch (priceFilter) {
          case 'under-500': return p.price < 500;
          case '500-1500': return p.price >= 500 && p.price <= 1500;
          case '1500-5000': return p.price >= 1500 && p.price <= 5000;
          case '5000-plus': return p.price > 5000;
          default: return true;
        }
      });
    }

    if (onSaleOnly) {
      result = result.filter((p) => p.originalPrice !== undefined);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'bestselling': return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return (b.rating ?? 0) - (a.rating ?? 0);
        case 'discount': return getDiscount(b) - getDiscount(a);
        case 'newest': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [activeCategory, search, sortBy, noiseFilters, priceFilter, onSaleOnly]);

  const toggleNoise = (level: NoiseFilter) => {
    setNoiseFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const clearAllFilters = () => {
    setNoiseFilters(new Set());
    setPriceFilter(null);
    setOnSaleOnly(false);
  };

  const updateQuantity = (product: Product, qty: number) => {
    setOrderItems((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(product.id);
      } else {
        next.set(product.id, { product, quantity: qty });
      }
      return next;
    });
  };

  const getQuantity = (id: string) => orderItems.get(id)?.quantity ?? 0;

  const orderTotal = useMemo(() => {
    let total = 0;
    let items = 0;
    orderItems.forEach((item) => {
      total += item.product.price * item.quantity;
      items += item.quantity;
    });
    return { total, items };
  }, [orderItems]);

  const handleAddAllToCart = () => {
    orderItems.forEach((item) => {
      addItem(item.product, item.quantity);
    });
    setOrderItems(new Map());
    openCart();
  };

  const clearAll = () => setOrderItems(new Map());

  return (
    <div className="pt-16 lg:pt-18 min-h-screen bg-surface-50 dark:bg-surface-950">
      <SEO
        title="Quick Order — Fast Fireworks Ordering"
        description="Quickly browse and add fireworks to your cart with our streamlined quick order tool. Filter by category, price, and noise level."
        canonical="/quick-order"
      />
      {/* Header */}
      <section className="pt-8 pb-8 lg:pt-10 lg:pb-10 bg-white dark:bg-surface-900">
        <Container size="wide">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
                <Zap size={14} className="text-brand-500" />
                <span className="text-label font-bold uppercase tracking-wider text-brand-500">Rapid Ordering</span>
              </div>
              <h1 className="font-display font-bold text-display-sm sm:text-display-md text-surface-900 dark:text-surface-50">
                Quick Order
              </h1>
              <p className="mt-2 text-body-lg text-surface-500 dark:text-surface-400 max-w-xl">
                Add quantities directly from the table — no need to visit each product page. Perfect for bulk and repeat orders.
              </p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-body-md text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>
        </Container>
      </section>

      <Container size="wide">
        <div className="py-6">
          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-body-sm font-medium whitespace-nowrap border transition-all duration-200',
                    activeCategory === cat.id
                      ? 'bg-brand-500 text-surface-950 border-brand-500'
                      : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-brand-500/50',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Filter Dropdown */}
              <div ref={filterRef} className="relative">
                <button
                  onClick={() => { setShowFilters(!showFilters); setShowSort(false); }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-body-sm font-medium border transition-all duration-200',
                    showFilters || activeFilterCount > 0
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                      : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-brand-500/50',
                  )}
                >
                  <Filter size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-[10px] font-bold text-surface-950">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown size={14} className={cn('transition-transform duration-200', showFilters && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl z-50 p-5"
                    >
                      {/* Noise Level */}
                      <div className="mb-5">
                        <p className="text-caption font-bold uppercase tracking-wider text-surface-400 mb-2.5">Noise Level</p>
                        <div className="flex gap-2">
                          {noiseOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => toggleNoise(opt.value)}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-body-sm font-medium border transition-all duration-200 flex-1 justify-center',
                                noiseFilters.has(opt.value)
                                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                                  : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-brand-500/30',
                              )}
                            >
                              {opt.value === 'low' ? <VolumeX size={13} /> : <Volume2 size={13} />}
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="mb-5">
                        <p className="text-caption font-bold uppercase tracking-wider text-surface-400 mb-2.5">Price Range</p>
                        <div className="grid grid-cols-2 gap-2">
                          {priceRanges.map((range) => (
                            <button
                              key={range.value}
                              onClick={() => setPriceFilter(priceFilter === range.value ? null : range.value)}
                              className={cn(
                                'px-3 py-2 rounded-lg text-body-sm font-medium border transition-all duration-200 text-center',
                                priceFilter === range.value
                                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                                  : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-brand-500/30',
                              )}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* On Sale Toggle */}
                      <div className="mb-5">
                        <button
                          onClick={() => setOnSaleOnly(!onSaleOnly)}
                          className={cn(
                            'w-full px-3 py-2.5 rounded-lg text-body-sm font-medium border transition-all duration-200 text-center',
                            onSaleOnly
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                              : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-red-500/30',
                          )}
                        >
                          On Sale Only
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-800">
                        <button
                          onClick={clearAllFilters}
                          className="text-body-sm font-medium text-surface-400 hover:text-red-500 transition-colors"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 rounded-lg bg-brand-500 text-surface-950 text-body-sm font-bold hover:bg-brand-600 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => { setShowSort(!showSort); setShowFilters(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-body-sm font-medium bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-brand-500/50 transition-colors"
                >
                  <ArrowUpDown size={14} />
                  <span className="hidden sm:inline">{sortOptions.find((s) => s.value === sortBy)?.label}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown size={14} className={cn('transition-transform duration-200', showSort && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {showSort && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xl z-50 py-2"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-2.5 text-body-sm font-medium transition-colors text-left',
                            sortBy === opt.value
                              ? 'text-brand-600 dark:text-brand-400 bg-brand-500/5'
                              : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850',
                          )}
                        >
                          {opt.label}
                          {sortBy === opt.value && <Check size={14} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {noiseFilters.size > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 text-body-sm text-brand-600 dark:text-brand-400">
                  Noise: {[...noiseFilters].join(', ')}
                  <button onClick={() => setNoiseFilters(new Set())} className="hover:text-red-500 ml-0.5"><X size={12} /></button>
                </span>
              )}
              {priceFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 text-body-sm text-brand-600 dark:text-brand-400">
                  {priceRanges.find((r) => r.value === priceFilter)?.label}
                  <button onClick={() => setPriceFilter(null)} className="hover:text-red-500 ml-0.5"><X size={12} /></button>
                </span>
              )}
              {onSaleOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-body-sm text-red-600 dark:text-red-400">
                  On Sale
                  <button onClick={() => setOnSaleOnly(false)} className="hover:text-red-500 ml-0.5"><X size={12} /></button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-caption text-surface-400 hover:text-red-500 transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Results count */}
          <p className="text-body-sm text-surface-400 mb-3">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>

          {/* Product Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : (
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 dark:bg-surface-850 border-b border-surface-200 dark:border-surface-800 text-label font-bold uppercase tracking-wider text-surface-500">
              <div className="col-span-4">Product</div>
              <div className="col-span-2 text-center">Label</div>
              <div className="col-span-1 text-center">Stock</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredProducts.map((product) => {
                const qty = getQuantity(product.id);
                const stock = getStockStatus(product);
                const discount = getDiscount(product);
                const isBestseller = product.badge === 'bestseller';
                const isPremium = product.badge === 'premium';
                return (
                  <motion.div
                    key={product.id}
                    layout
                    className={cn(
                      'transition-colors',
                      qty > 0 && 'bg-brand-500/5 dark:bg-brand-500/10',
                      !product.inStock && 'opacity-50',
                    )}
                  >
                    {/* Desktop Row */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
                      <div className="col-span-4 flex items-center gap-4">
                        <Link to={`/product/${product.slug}`} className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-850 flex-shrink-0 hover:opacity-80 transition-opacity">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            to={`/product/${product.slug}`}
                            className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-100 hover:text-brand-500 dark:hover:text-brand-400 transition-colors truncate block"
                          >
                            {product.name}
                          </Link>
                          <p className="text-caption text-surface-500 truncate">{product.shortDescription}</p>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center justify-center">
                        {isBestseller ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Award size={13} className="text-amber-500" />
                            <span className="text-caption font-bold text-amber-600 dark:text-amber-400">Best Seller</span>
                          </span>
                        ) : isPremium ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                            <Crown size={13} className="text-violet-500" />
                            <span className="text-caption font-bold text-violet-600 dark:text-violet-400">Premium</span>
                          </span>
                        ) : (
                          <span className="text-surface-300 dark:text-surface-700">—</span>
                        )}
                      </div>

                      <div className="col-span-1 flex items-center gap-1.5">
                        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', stock.dot)} />
                        <span className={cn('text-caption font-medium', stock.color)}>{stock.label}</span>
                      </div>

                      <div className="col-span-2 flex items-center gap-2 justify-end">
                        <span className="font-display font-bold text-body-lg text-brand-600 dark:text-brand-400">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-caption text-surface-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      <div className="col-span-3 flex items-center justify-center gap-2">
                        {!product.inStock ? (
                          <span className="text-body-sm text-surface-400 font-medium">Unavailable</span>
                        ) : qty === 0 ? (
                          <button
                            onClick={() => updateQuantity(product, 1)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-brand-500 hover:text-surface-950 text-body-sm font-medium transition-all duration-200"
                          >
                            <Plus size={16} />
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(product, qty - 1)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            >
                              {qty === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                            </button>
                            <input
                              type="number"
                              value={qty}
                              onChange={(e) => updateQuantity(product, Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-14 h-9 rounded-lg text-center bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-body-sm font-bold text-surface-900 dark:text-surface-100 focus:outline-none focus:border-brand-500"
                              min={0}
                              max={99}
                            />
                            <button
                              onClick={() => updateQuantity(product, qty + 1)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                            >
                              <Plus size={15} />
                            </button>
                            <span className="ml-2 text-body-sm font-semibold text-brand-600 dark:text-brand-400 min-w-[70px] text-right">
                              {formatPrice(product.price * qty)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div className="md:hidden flex gap-3 px-4 py-3">
                      <Link to={`/product/${product.slug}`} className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-850 flex-shrink-0 hover:opacity-80 transition-opacity">
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${product.slug}`}
                            className="font-display font-semibold text-body-sm text-surface-900 dark:text-surface-100 hover:text-brand-500 transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <span className={cn('flex items-center gap-1 text-caption font-medium whitespace-nowrap', stock.color)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', stock.dot)} />
                            {stock.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isBestseller && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] font-bold text-amber-500">
                              <Award size={10} /> Best Seller
                            </span>
                          )}
                          {isPremium && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/10 text-[10px] font-bold text-violet-500">
                              <Crown size={10} /> Premium
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-body-md text-brand-600 dark:text-brand-400">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-caption text-surface-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1 py-0.5 rounded">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          {!product.inStock ? (
                            <span className="text-caption text-surface-400">Unavailable</span>
                          ) : qty === 0 ? (
                            <button
                              onClick={() => updateQuantity(product, 1)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-brand-500 hover:text-surface-950 text-caption font-medium transition-all"
                            >
                              <Plus size={14} />
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(product, qty - 1)}
                                className="w-7 h-7 rounded-md flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              >
                                {qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                              </button>
                              <span className="w-8 text-center text-body-sm font-bold text-surface-900 dark:text-surface-100">{qty}</span>
                              <button
                                onClick={() => updateQuantity(product, qty + 1)}
                                className="w-7 h-7 rounded-md flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-body-lg text-surface-500 font-medium">No products match your filters</p>
                <button
                  onClick={() => { clearAllFilters(); setSearch(''); setActiveCategory('all'); }}
                  className="mt-2 text-body-sm text-brand-500 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </Container>

      {/* Sticky Bottom Bar */}
      {orderTotal.items > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 shadow-2xl"
        >
          <Container size="wide">
            <div className="flex items-center justify-between py-4 gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-body-sm text-surface-500">
                    {orderTotal.items} item{orderTotal.items !== 1 ? 's' : ''} selected
                  </p>
                  <p className="font-display font-bold text-heading-md text-brand-600 dark:text-brand-400">
                    {formatPrice(orderTotal.total)}
                  </p>
                </div>
                <button
                  onClick={clearAll}
                  className="text-body-sm text-surface-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <Button onClick={handleAddAllToCart} size="lg" className="group">
                <ShoppingCart size={18} />
                Add All to Cart
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Container>
        </motion.div>
      )}
    </div>
  );
}
