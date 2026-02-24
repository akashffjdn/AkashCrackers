import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout } from '@/layouts/MainLayout.tsx';
import { HomePage } from '@/pages/HomePage.tsx';

// Lazy load non-critical pages for performance
const ShopPage = lazy(() => import('@/pages/ShopPage.tsx').then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() => import('@/pages/ProductPage.tsx').then((m) => ({ default: m.ProductPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage.tsx').then((m) => ({ default: m.CheckoutPage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-3 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-body-sm text-surface-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
