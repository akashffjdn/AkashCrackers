import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout } from '@/layouts/MainLayout.tsx';
import { AuthLayout } from '@/layouts/AuthLayout.tsx';
import { ProtectedRoute } from '@/components/atoms/ProtectedRoute.tsx';
import { useAuthListener } from '@/hooks/useAuth.ts';
import { HomePage } from '@/pages/HomePage.tsx';

// Lazy load all non-home pages for optimal code splitting
const ShopPage = lazy(() => import('@/pages/ShopPage.tsx').then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() => import('@/pages/ProductPage.tsx').then((m) => ({ default: m.ProductPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage.tsx').then((m) => ({ default: m.CheckoutPage })));
const QuickOrderPage = lazy(() => import('@/pages/QuickOrderPage.tsx').then((m) => ({ default: m.QuickOrderPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage.tsx').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage.tsx').then((m) => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('@/pages/FAQPage.tsx').then((m) => ({ default: m.FAQPage })));
const SafetyPage = lazy(() => import('@/pages/SafetyPage.tsx').then((m) => ({ default: m.SafetyPage })));
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage.tsx').then((m) => ({ default: m.TrackOrderPage })));
const BulkOrdersPage = lazy(() => import('@/pages/BulkOrdersPage.tsx').then((m) => ({ default: m.BulkOrdersPage })));
const ShippingPage = lazy(() => import('@/pages/ShippingPage.tsx').then((m) => ({ default: m.ShippingPage })));
const ReturnsPage = lazy(() => import('@/pages/ReturnsPage.tsx').then((m) => ({ default: m.ReturnsPage })));
const TermsPage = lazy(() => import('@/pages/TermsPage.tsx').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage.tsx').then((m) => ({ default: m.PrivacyPage })));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage.tsx').then((m) => ({ default: m.OrderConfirmationPage })));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage.tsx').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage.tsx').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage.tsx').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage.tsx').then((m) => ({ default: m.ResetPasswordPage })));

// Account pages
const AccountLayout = lazy(() => import('@/layouts/AccountLayout.tsx').then((m) => ({ default: m.AccountLayout })));
const AccountDashboardPage = lazy(() => import('@/pages/account/AccountDashboardPage.tsx').then((m) => ({ default: m.AccountDashboardPage })));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage.tsx').then((m) => ({ default: m.ProfilePage })));
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage.tsx').then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage.tsx').then((m) => ({ default: m.OrderDetailPage })));
const AddressBookPage = lazy(() => import('@/pages/account/AddressBookPage.tsx').then((m) => ({ default: m.AddressBookPage })));
const SecurityPage = lazy(() => import('@/pages/account/SecurityPage.tsx').then((m) => ({ default: m.SecurityPage })));
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage.tsx').then((m) => ({ default: m.WishlistPage })));
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage.tsx').then((m) => ({ default: m.NotificationsPage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-3 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-body-sm text-surface-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  useAuthListener();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth pages — minimal layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Main site */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/quick-order" element={<QuickOrderPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/bulk-orders" element={<BulkOrdersPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Protected account routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<AccountDashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                <Route path="addresses" element={<AddressBookPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
