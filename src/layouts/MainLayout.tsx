import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/organisms/Navbar.tsx';
import { Footer } from '@/components/organisms/Footer.tsx';
import { CartDrawer } from '@/components/organisms/CartDrawer.tsx';
import { ScrollToTop } from '@/components/atoms/ScrollToTop.tsx';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
