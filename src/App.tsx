import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.tsx').then((m) => ({ default: m.NotFoundPage })));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage.tsx').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage.tsx').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage.tsx').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage.tsx').then((m) => ({ default: m.ResetPasswordPage })));
const OAuthCallbackPage = lazy(() => import('@/pages/auth/OAuthCallbackPage.tsx').then((m) => ({ default: m.OAuthCallbackPage })));

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

// Admin pages (lazy-loaded — zero impact on customer bundle)
const AdminRoute = lazy(() => import('@/components/atoms/AdminRoute.tsx').then((m) => ({ default: m.AdminRoute })));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout.tsx').then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage.tsx').then((m) => ({ default: m.AdminDashboardPage })));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage.tsx').then((m) => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage.tsx').then((m) => ({ default: m.AdminOrderDetailPage })));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage.tsx').then((m) => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage.tsx').then((m) => ({ default: m.AdminProductFormPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage.tsx').then((m) => ({ default: m.AdminUsersPage })));
const AdminUserDetailPage = lazy(() => import('@/pages/admin/AdminUserDetailPage.tsx').then((m) => ({ default: m.AdminUserDetailPage })));
const AdminUserEditPage = lazy(() => import('@/pages/admin/AdminUserEditPage.tsx').then((m) => ({ default: m.AdminUserEditPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage.tsx').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminCategoryFormPage = lazy(() => import('@/pages/admin/AdminCategoryFormPage.tsx').then((m) => ({ default: m.AdminCategoryFormPage })));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage.tsx').then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminProductsAnalyticsPage = lazy(() => import('@/pages/admin/AdminProductsAnalyticsPage.tsx').then((m) => ({ default: m.AdminProductsAnalyticsPage })));
const AdminContentPage = lazy(() => import('@/pages/admin/AdminContentPage.tsx').then((m) => ({ default: m.AdminContentPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage.tsx').then((m) => ({ default: m.AdminSettingsPage })));
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage.tsx').then((m) => ({ default: m.AdminProfilePage })));
const AdminBillingPage = lazy(() => import('@/pages/admin/AdminBillingPage.tsx').then((m) => ({ default: m.AdminBillingPage })));
const AdminBillsPage = lazy(() => import('@/pages/admin/AdminBillsPage.tsx').then((m) => ({ default: m.AdminBillsPage })));

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
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
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

            {/* 404 — catch all unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin panel (protected + role-gated) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="billing" element={<AdminBillingPage />} />
              <Route path="bills" element={<AdminBillsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:productId/edit" element={<AdminProductFormPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="users/:uid" element={<AdminUserDetailPage />} />
              <Route path="users/:uid/edit" element={<AdminUserEditPage />} />
              <Route path="customers" element={<Navigate to="/admin/users" replace />} />
              <Route path="customers/:uid" element={<Navigate to="/admin/users" replace />} />
              <Route path="inventory" element={<Navigate to="/admin/products" replace />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="categories/new" element={<AdminCategoryFormPage />} />
              <Route path="categories/:categoryId/edit" element={<AdminCategoryFormPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="analytics/products" element={<AdminProductsAnalyticsPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
