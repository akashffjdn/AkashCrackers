import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  Phone,
  Banknote,
  Smartphone,
  CreditCard,
  ShoppingBag,
  X,
  Printer,
  Download,
  Share2,
  RotateCcw,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.ts';
import { cn } from '@/lib/utils.ts';
import type { AdminProduct, Bill, BillPaymentMethod } from '@/types/admin.ts';

// ─── Cart item type ───
interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

const categoryLabels: Record<string, string> = {
  aerial: 'Aerial',
  ground: 'Ground',
  rockets: 'Rockets',
  sparklers: 'Sparklers',
  fountains: 'Fountains',
  'roman-candles': 'Roman Candles',
  novelty: 'Novelty',
  'combo-packs': 'Combos',
};

const discountPresets = [0, 40, 50, 55, 60];

export function AdminBillingPage() {
  const user = useAuthStore((s) => s.user);

  // Products
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Discount
  const [discountPercent, setDiscountPercent] = useState(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<BillPaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  // Packaging fee
  const [packagingFeeEnabled, setPackagingFeeEnabled] = useState(false);
  const [packagingFeeAmount, setPackagingFeeAmount] = useState(0);

  // Bill result
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load products + packaging fee from settings
  useEffect(() => {
    (async () => {
      try {
        const { getActiveProducts, getSiteSettings } = await import('@/services/admin.ts');
        setProducts(getActiveProducts());
        const settings = await getSiteSettings();
        if (settings?.shippingRates?.packagingFee) {
          setPackagingFeeAmount(settings.shippingRates.packagingFee);
        }
      } catch { /* */ }
      finally { setIsLoadingProducts(false); }
    })();
  }, []);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearch('');
        searchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Filtered products
  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }
    return list;
  }, [products, activeCategory, search]);

  // Categories with counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(categoryLabels)
      .filter(([key]) => counts[key])
      .map(([key, label]) => ({ key, label, count: counts[key] }));
  }, [products]);

  // Cart operations
  const addToCart = useCallback((product: AdminProduct) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) =>
          c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.images[0] || '',
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.productId === productId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountPercent(0);
    setCashReceived('');
    setPaymentRef('');
    setPaymentMethod('cash');
    setPackagingFeeEnabled(false);
  };

  // Calculations
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const totalDiscount = Math.round(subtotal * (discountPercent / 100));
  const taxableAmount = subtotal - totalDiscount;
  const packagingFee = packagingFeeEnabled ? packagingFeeAmount : 0;
  const cgst = Math.round((taxableAmount + packagingFee) * 0.09);
  const sgst = Math.round((taxableAmount + packagingFee) * 0.09);
  const grandTotal = taxableAmount + packagingFee + cgst + sgst;
  const totalQuantity = cart.reduce((sum, c) => sum + c.quantity, 0);
  const changeAmount =
    paymentMethod === 'cash' && cashReceived
      ? Number(cashReceived) - grandTotal
      : 0;

  // Generate bill
  const handleGenerateBill = async () => {
    if (cart.length === 0) return;
    setIsSaving(true);
    try {
      const { createBill } = await import('@/services/admin.ts');
      const billItems = cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        image: c.image,
        quantity: c.quantity,
        unitPrice: c.price,
        taxableValue: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: 0,
      }));
      const payment = {
        method: paymentMethod,
        amount: grandTotal,
        reference: paymentRef || undefined,
        receivedAmount:
          paymentMethod === 'cash' && cashReceived
            ? Number(cashReceived)
            : undefined,
        changeAmount:
          paymentMethod === 'cash' && changeAmount > 0
            ? changeAmount
            : undefined,
      };
      const bill = await createBill(
        billItems,
        payment,
        { percent: discountPercent },
        { name: customerName || undefined, phone: customerPhone || undefined },
        user?.uid ?? '',
        packagingFee,
      );
      setCompletedBill(bill);
    } catch {
      /* handle error */
    } finally {
      setIsSaving(false);
    }
  };

  // New bill after completion
  const handleNewBill = () => {
    setCompletedBill(null);
    clearCart();
    searchRef.current?.focus();
  };

  // Print receipt
  // ─── Bill Confirmation Modal ───
  if (completedBill) {
    return <BillConfirmation bill={completedBill} onNewBill={handleNewBill} />;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-4 lg:-m-6 xl:-m-8">
      {/* ═══════ LEFT PANEL — Product Selection (60%) ═══════ */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-surface-200 dark:border-surface-800">
        {/* Search */}
        <div className="p-3 border-b border-surface-100 dark:border-surface-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products... ( / )"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-body-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-shadow"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-800 flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-caption font-medium whitespace-nowrap transition-colors flex-shrink-0',
              activeCategory === 'all'
                ? 'bg-brand-500 text-white'
                : 'text-surface-500 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700',
            )}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-caption font-medium whitespace-nowrap transition-colors flex-shrink-0',
                activeCategory === cat.key
                  ? 'bg-brand-500 text-white'
                  : 'text-surface-500 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700',
              )}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={32} className="text-surface-300 mb-2" />
              <p className="text-body-sm text-surface-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {filtered.map((product) => {
                const inCart = cart.find((c) => c.productId === product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    className={cn(
                      'relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all hover:shadow-sm group',
                      inCart
                        ? 'border-brand-500/40 bg-brand-500/5 dark:bg-brand-500/10'
                        : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300',
                    )}
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full aspect-square rounded-lg object-cover mb-2 bg-surface-100 dark:bg-surface-800"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-2">
                        <ShoppingBag size={20} className="text-surface-300" />
                      </div>
                    )}
                    <p className="text-caption font-medium text-surface-900 dark:text-surface-100 line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-body-sm font-bold text-surface-900 dark:text-surface-100">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-caption text-surface-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    {inCart && (
                      <span className="absolute top-1.5 right-1.5 min-w-[20px] h-5 px-1 rounded-md bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ RIGHT PANEL — Cart & Billing (40%) ═══════ */}
      <div className="w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col bg-white dark:bg-surface-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-brand-500" />
            <h2 className="font-display font-semibold text-body-sm text-surface-900 dark:text-surface-50">
              New Bill
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-caption font-medium text-surface-400 hover:text-red-500 transition-colors"
            >
              <RotateCcw size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Customer (collapsible) */}
        <div className="px-4 py-2.5 border-b border-surface-100 dark:border-surface-800">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-caption text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
              />
            </div>
            <div className="relative">
              <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="tel"
                placeholder="Phone *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-caption text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
              />
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <ShoppingBag size={28} className="text-surface-300 mb-2" />
              <p className="text-body-sm text-surface-400">Add products from the left panel</p>
              <p className="text-caption text-surface-300 mt-1">Click any product to add it</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {cart.map((item, idx) => (
                <div key={item.productId} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-caption text-surface-400 w-4 text-center flex-shrink-0">{idx + 1}</span>
                  {item.image ? (
                    <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-surface-100" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={14} className="text-surface-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-medium text-surface-900 dark:text-surface-100 truncate">{item.name}</p>
                    <p className="text-caption text-surface-400">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-caption font-bold text-surface-900 dark:text-surface-100 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-body-sm font-semibold text-surface-900 dark:text-surface-100 w-16 text-right tabular-nums flex-shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 rounded text-surface-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section — Discount, Summary, Payment, Actions */}
        {cart.length > 0 && (
          <div className="border-t border-surface-200 dark:border-surface-800">
            {/* Discount */}
            <div className="px-4 py-2.5 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-caption font-medium text-surface-600 dark:text-surface-400">Discount</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-14 text-center py-0.5 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-caption font-bold text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                  />
                  <span className="text-caption text-surface-400">%</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {discountPresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setDiscountPercent(p)}
                    className={cn(
                      'flex-1 py-1 rounded-md text-caption font-medium transition-colors',
                      discountPercent === p
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700',
                    )}
                  >
                    {p === 0 ? 'None' : `${p}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="px-4 py-2.5 border-b border-surface-100 dark:border-surface-800 space-y-1">
              <div className="flex justify-between text-caption text-surface-500">
                <span>Subtotal ({totalQuantity} items)</span>
                <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-caption text-green-600">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="tabular-nums">-₹{totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {packagingFeeAmount > 0 && (
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setPackagingFeeEnabled(!packagingFeeEnabled)}
                    className={cn(
                      'flex items-center gap-1.5 text-caption font-medium transition-colors',
                      packagingFeeEnabled ? 'text-amber-600' : 'text-surface-400 hover:text-surface-600',
                    )}
                  >
                    <Package size={12} />
                    Packaging Fee
                    <span className={cn(
                      'inline-flex items-center justify-center w-8 h-4 rounded-full text-[10px] font-bold transition-colors',
                      packagingFeeEnabled
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-surface-200 dark:bg-surface-700 text-surface-400',
                    )}>
                      {packagingFeeEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <span className={cn(
                    'text-caption tabular-nums',
                    packagingFeeEnabled ? 'text-amber-600 font-medium' : 'text-surface-300 line-through',
                  )}>
                    ₹{packagingFeeAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-caption text-surface-400">
                <span>CGST (9%)</span>
                <span className="tabular-nums">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-caption text-surface-400">
                <span>SGST (9%)</span>
                <span className="tabular-nums">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-surface-100 dark:border-surface-800">
                <span className="text-body-sm font-bold text-surface-900 dark:text-surface-100">Total</span>
                <span className="text-body-md font-bold text-surface-900 dark:text-surface-100 tabular-nums">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="px-4 py-2.5 border-b border-surface-100 dark:border-surface-800">
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {([
                  { method: 'cash' as const, icon: Banknote, label: 'Cash' },
                  { method: 'upi' as const, icon: Smartphone, label: 'UPI' },
                  { method: 'card' as const, icon: CreditCard, label: 'Card' },
                ]).map(({ method, icon: Icon, label }) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2 rounded-lg text-caption font-medium transition-colors',
                      paymentMethod === method
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700',
                    )}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
              {paymentMethod === 'cash' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-surface-500 w-16">Received</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder={String(grandTotal)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-body-sm font-semibold text-surface-900 dark:text-surface-100 placeholder:text-surface-300 focus:outline-none focus:ring-1 focus:ring-brand-500/30 tabular-nums"
                    />
                  </div>
                  {cashReceived && Number(cashReceived) >= grandTotal && (
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10">
                      <span className="text-caption text-green-600 dark:text-green-400">Change</span>
                      <span className="text-body-sm font-bold text-green-600 dark:text-green-400 tabular-nums">
                        ₹{changeAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {paymentMethod === 'upi' && (
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="UPI Txn ID (optional)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-caption text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                />
              )}
              {paymentMethod === 'card' && (
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Card Ref No. (optional)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-caption text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                />
              )}
            </div>

            {/* Generate Bill Button */}
            <div className="p-3">
              <button
                onClick={handleGenerateBill}
                disabled={isSaving || cart.length === 0 || !customerName.trim() || !customerPhone.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-white font-semibold text-body-sm hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm shadow-brand-500/20"
              >
                <Receipt size={16} />
                {isSaving ? 'Generating...' : `Generate Bill  -  ₹${grandTotal.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bill Confirmation Screen ───

async function downloadBillPDF(bill: Bill) {
  const [{ pdf }, { BillPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/admin/BillPDF.tsx'),
  ]);
  const blob = await pdf(BillPDF({ bill })).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bill.billNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

async function printBillPDF(bill: Bill) {
  const [{ pdf }, { BillPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/admin/BillPDF.tsx'),
  ]);
  const blob = await pdf(BillPDF({ bill })).toBlob();
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.addEventListener('load', () => printWindow.print());
  }
}

function BillConfirmation({
  bill,
  onNewBill,
}: {
  bill: Bill;
  onNewBill: () => void;
}) {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] -m-4 lg:-m-6 xl:-m-8 bg-surface-50 dark:bg-surface-950">
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center p-6 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <h2 className="font-display font-bold text-body-lg text-surface-900 dark:text-surface-50">
            Bill Generated
          </h2>
          <p className="text-caption text-surface-400 mt-1">
            {new Date(bill.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Bill Details */}
        <div className="px-6 pb-4">
          <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-4 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-caption text-surface-500">Bill No.</span>
              <span className="text-body-sm font-bold text-surface-900 dark:text-surface-100 font-mono">
                {bill.billNumber}
              </span>
            </div>
            {bill.customerName && (
              <div className="flex justify-between">
                <span className="text-caption text-surface-500">Customer</span>
                <span className="text-caption font-medium text-surface-900 dark:text-surface-100">
                  {bill.customerName}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-caption text-surface-500">Items</span>
              <span className="text-caption font-medium text-surface-900 dark:text-surface-100">
                {bill.itemCount} items ({bill.totalQuantity} qty)
              </span>
            </div>
            {bill.discountPercent > 0 && (
              <div className="flex justify-between">
                <span className="text-caption text-surface-500">Discount</span>
                <span className="text-caption font-medium text-green-600">
                  {bill.discountPercent}% (-₹{bill.totalDiscount.toLocaleString('en-IN')})
                </span>
              </div>
            )}
            {bill.packagingFee > 0 && (
              <div className="flex justify-between">
                <span className="text-caption text-surface-500">Packaging Fee</span>
                <span className="text-caption text-surface-900 dark:text-surface-100 tabular-nums">
                  ₹{bill.packagingFee.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-caption text-surface-500">GST (18%)</span>
              <span className="text-caption text-surface-900 dark:text-surface-100 tabular-nums">
                ₹{(bill.totalCgst + bill.totalSgst).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-surface-200 dark:border-surface-700">
              <span className="text-body-sm font-bold text-surface-900 dark:text-surface-100">Total</span>
              <span className="text-body-lg font-bold text-brand-600 dark:text-brand-400 tabular-nums">
                ₹{bill.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-caption text-surface-500">Payment</span>
              <span className="text-caption font-medium text-surface-900 dark:text-surface-100 capitalize">
                {bill.payment.method}
                {bill.payment.changeAmount && bill.payment.changeAmount > 0
                  ? ` (Change: ₹${bill.payment.changeAmount})`
                  : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              disabled={isPdfLoading}
              onClick={async () => {
                setIsPdfLoading(true);
                try { await printBillPDF(bill); } finally { setIsPdfLoading(false); }
              }}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
            >
              <Printer size={16} />
              <span className="text-caption font-medium">Print</span>
            </button>
            <button
              disabled={isPdfLoading}
              onClick={async () => {
                setIsPdfLoading(true);
                try { await downloadBillPDF(bill); } finally { setIsPdfLoading(false); }
              }}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              <span className="text-caption font-medium">PDF</span>
            </button>
            <button
              onClick={() => {
                if (!bill.customerPhone) return;
                const text = `Bill: ${bill.billNumber}%0ATotal: ₹${bill.grandTotal}%0AThank you for shopping at Akash Crackers!`;
                window.open(`https://wa.me/91${bill.customerPhone}?text=${text}`, '_blank');
              }}
              disabled={!bill.customerPhone}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-40"
            >
              <Share2 size={16} />
              <span className="text-caption font-medium">WhatsApp</span>
            </button>
          </div>
          <button
            onClick={onNewBill}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-white font-semibold text-body-sm hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20"
          >
            <Plus size={16} />
            New Bill
          </button>
        </div>
      </div>
    </div>
  );
}

