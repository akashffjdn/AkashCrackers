import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.ts';
import { useWishlistStore } from '@/store/wishlist.ts';

const TOKENS_KEY = 'akash-crackers-tokens';

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    const tokensRaw = localStorage.getItem(TOKENS_KEY);

    if (!tokensRaw) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Validate session by calling GET /api/auth/me
    (async () => {
      try {
        const { getMe } = await import('@/services/auth.ts');
        const user = await getMe();
        setUser(user);
        fetchWishlist();
      } catch {
        // Token invalid or expired (and refresh failed in interceptor)
        setUser(null);
        clearWishlist();
        localStorage.removeItem(TOKENS_KEY);
      }
    })();
  }, [setUser, setLoading, fetchWishlist, clearWishlist]);
}
