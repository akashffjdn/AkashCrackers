import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { SEO } from '@/components/SEO.tsx';

export function NotFoundPage() {
  return (
    <div className="pt-24 min-h-screen flex items-center">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Browse our premium fireworks collection or return to the homepage."
        noIndex
      />
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto py-20"
        >
          <p className="text-[8rem] leading-none font-display font-black text-brand-500/20">
            404
          </p>
          <h1 className="mt-4 font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">
            Page Not Found
          </h1>
          <p className="mt-4 text-body-lg text-surface-500 dark:text-surface-400">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button size="lg">
                <Home size={18} />
                Back to Home
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg">
                <ShoppingBag size={18} />
                Browse Shop
              </Button>
            </Link>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center gap-2 text-body-sm text-surface-500 hover:text-brand-500 transition-colors"
          >
            <ArrowLeft size={16} />
            Go back to previous page
          </button>
        </motion.div>
      </Container>
    </div>
  );
}
