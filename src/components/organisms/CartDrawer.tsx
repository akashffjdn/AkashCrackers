import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/atoms/Button.tsx';
import { CartItemCard } from '@/components/molecules/CartItemCard.tsx';
import { useCartStore } from '@/store/cart.ts';
import { formatPrice } from '@/lib/utils.ts';

export function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice, totalSavings } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-surface-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-brand-500" />
                <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50">
                  Your Cart
                </h2>
                <span className="text-body-sm text-surface-500">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Close cart"
              >
                <X size={22} />
              </button>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                  <ShoppingBag size={32} className="text-surface-400" />
                </div>
                <p className="font-display font-semibold text-heading-sm text-surface-900 dark:text-surface-100">
                  Your cart is empty
                </p>
                <p className="mt-2 text-body-sm text-surface-500">
                  Add some premium fireworks to get started!
                </p>
                <Link to="/shop" onClick={closeCart} className="mt-6">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6">
                  {items.map((item) => (
                    <CartItemCard key={item.product.id} item={item} />
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-surface-200 dark:border-surface-800 p-6 space-y-4">
                  {totalSavings() > 0 && (
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        You save
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatPrice(totalSavings())}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-heading-sm text-surface-900 dark:text-surface-50">
                      Total
                    </span>
                    <span className="font-display font-bold text-heading-md text-brand-600 dark:text-brand-400">
                      {formatPrice(totalPrice())}
                    </span>
                  </div>
                  <Link to="/checkout" onClick={closeCart} className="block">
                    <Button fullWidth size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full text-center text-body-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
