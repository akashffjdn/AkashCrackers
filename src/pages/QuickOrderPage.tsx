import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, ArrowRight,
  Zap, Filter, ChevronDown, Volume2, VolumeX, Tag, X,
  ArrowUpDown,
} from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { Badge } from '@/components/atoms/Badge.tsx';
import { useCartStore } from '@/store/cart.ts';
import { products, categories } from '@/data/products.ts';
import { formatPrice, cn } from '@/lib/utils.ts';
import type { Product, ProductBadge } from '@/types/index.ts';

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

const noiseOptions: { value: NoiseFilter; label: string; icon: typeof Volume2 }[] = [
  { value: 'low', label: 'Low', icon: VolumeX },
  { value: 'medium', label: 'Medium', icon: Volume2 },
  { value: 'high', label: 'High', icon: Volume2 },
];

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: 'under-500', label: 'Under ₹500' },
  { value: '500-1500', label: '₹500 – ₹1,500' },
  { value: '1500-5000', label: '₹1,500 – ₹5,000' },
  { value: '5000-plus', label: '₹5,000+' },
];

const badgeOptions: { value: ProductBadge; label: string }[] = [
  { value: 'bestseller', label: 'Best Seller' },
  { value: 'premium', label: 'Premium' },
  { value: 'new', label: 'New' },
  { value: 'limited', label: 'Limited' },
  { value: 'low-noise', label: 'Low Noise' },
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

export function QuickOrderPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('bestselling');
  const [noiseFilters, setNoiseFilters] = useState<Set<NoiseFilter>>(new Set());
  const [priceFilter, setPriceFilter] = useState<PriceRange | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<ProductBadge | null>(null);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [orderItems, setOrderItems] = useState<Map<string, QuickOrderItem>>(new Map());
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (noiseFilters.size > 0) count++;
    if (priceFilter) count++;
    if (badgeFilter) count++;
    if (onSaleOnly) count++;
    return count;
  }, [noiseFilters, priceFilter, badgeFilter, onSaleOnly]);

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

    // Noise filter
    if (noiseFilters.size > 0) {
      result = result.filter((p) => noiseFilters.has(p.noiseLevel));
    }

    // Price range
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

    // Badge filter
    if (badgeFilter) {
      result = result.filter((p) => p.badge === badgeFilter);
    }

    // On sale
    if (onSaleOnly) {
      result = result.filter((p) => p.originalPrice !== undefined);
    }

    // Sorting
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
  }, [activeCategory, search, sortBy, noiseFilters, priceFilter, badgeFilter, onSaleOnly]);

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
    setBadgeFilter(null);
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
            {/* Search */}
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
        <div className="py-8">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Row 1: Categories + Sort */}
            <div className="flex items-center justify-between gap-4">
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
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
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
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none pl-9 pr-8 py-2 rounded-full text-body-sm font-medium bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-brand-500/50 focus:outline-none focus:border-brand-500 cursor-pointer transition-colors"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ArrowUpDown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
              >
                {/* Noise Level */}
                <div className="flex items-center gap-2">
                  <span className="text-caption font-bold uppercase tracking-wider text-surface-400">Noise:</span>
                  {noiseOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleNoise(opt.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium border transition-all duration-200',
                        noiseFilters.has(opt.value)
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                          : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-brand-500/30',
                      )}
                    >
                      {opt.value === 'low' ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <span className="text-caption font-bold uppercase tracking-wider text-surface-400">Price:</span>
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setPriceFilter(priceFilter === range.value ? null : range.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-body-sm font-medium border transition-all duration-200',
                        priceFilter === range.value
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                          : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-brand-500/30',
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

                {/* Badge Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-caption font-bold uppercase tracking-wider text-surface-400">Tag:</span>
                  {badgeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBadgeFilter(badgeFilter === opt.value ? null : opt.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium border transition-all duration-200',
                        badgeFilter === opt.value
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                          : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-brand-500/30',
                      )}
                    >
                      <Tag size={12} />
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

                {/* On Sale Toggle */}
                <button
                  onClick={() => setOnSaleOnly(!onSaleOnly)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-body-sm font-medium border transition-all duration-200',
                    onSaleOnly
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                      : 'text-surface-500 border-surface-200 dark:border-surface-700 hover:border-red-500/30',
                  )}
                >
                  On Sale
                </button>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-body-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <X size={12} />
                    Clear
                  </button>
                )}
              </motion.div>
            )}

            {/* Active Filter Tags */}
            {activeFilterCount > 0 && !showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-caption text-surface-400">Active:</span>
                {noiseFilters.size > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 text-body-sm text-brand-600 dark:text-brand-400">
                    Noise: {[...noiseFilters].join(', ')}
                    <button onClick={() => setNoiseFilters(new Set())} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                {priceFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 text-body-sm text-brand-600 dark:text-brand-400">
                    {priceRanges.find((r) => r.value === priceFilter)?.label}
                    <button onClick={() => setPriceFilter(null)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                {badgeFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 text-body-sm text-brand-600 dark:text-brand-400">
                    {badgeOptions.find((b) => b.value === badgeFilter)?.label}
                    <button onClick={() => setBadgeFilter(null)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                {onSaleOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-body-sm text-red-600 dark:text-red-400">
                    On Sale
                    <button onClick={() => setOnSaleOnly(false)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                <button onClick={clearAllFilters} className="text-caption text-surface-400 hover:text-red-500 transition-colors">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-body-sm text-surface-400">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Product Table */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 dark:bg-surface-850 border-b border-surface-200 dark:border-surface-800 text-label font-bold uppercase tracking-wider text-surface-500">
              <div className="col-span-5">Product</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-4 text-center">Quantity</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredProducts.map((product) => {
                const qty = getQuantity(product.id);
                const stock = getStockStatus(product);
                const discount = getDiscount(product);
                return (
                  <motion.div
                    key={product.id}
                    layout
                    className={cn(
                      'grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-6 py-4 items-center transition-colors',
                      qty > 0 && 'bg-brand-500/5 dark:bg-brand-500/10',
                      !product.inStock && 'opacity-50',
                    )}
                  >
                    {/* Product Info — badge on image */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-850 flex-shrink-0">
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        {product.badge && (
                          <div className="absolute top-0 left-0">
                            <Badge type={product.badge} className="text-[8px] px-1 py-0.5 rounded-none rounded-br-md" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/product/${product.slug}`}
                          className="font-display font-semibold text-body-md text-surface-900 dark:text-surface-100 hover:text-brand-500 dark:hover:text-brand-400 transition-colors truncate block"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-caption text-surface-500 truncate">{product.shortDescription}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="md:col-span-1 hidden md:flex items-center gap-1.5">
                      <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', stock.dot)} />
                      <span className={cn('text-caption font-medium', stock.color)}>{stock.label}</span>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 flex items-center gap-2 md:justify-end">
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

                    {/* Quantity Control */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-center gap-2">
                      {!product.inStock ? (
                        <span className="text-body-sm text-surface-400 font-medium">Unavailable</span>
                      ) : qty === 0 ? (
                        <button
                          onClick={() => updateQuantity(product, 1)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-brand-500 hover:text-surface-950 text-body-sm font-medium transition-all duration-200 w-full md:w-auto justify-center"
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
