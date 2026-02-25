import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.ts';
import { useWishlistStore } from '@/store/wishlist.ts';

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    setLoading(true);

    // Dynamically import Firebase to keep it out of the initial bundle
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const [{ onAuthStateChanged }, { auth }, { mapFirebaseUser }, { getUserProfile, createUserProfile }] =
        await Promise.all([
          import('firebase/auth'),
          import('@/lib/firebase.ts'),
          import('@/services/auth.ts'),
          import('@/services/firestore.ts'),
        ]);

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const profile = mapFirebaseUser(firebaseUser);
          const existing = await getUserProfile(profile.uid).catch(() => null);
          if (!existing) {
            await createUserProfile(profile).catch(() => {});
          }
          setUser(existing ?? profile);
          fetchWishlist(profile.uid);
        } else {
          setUser(null);
          clearWishlist();
        }
      });
    })();

    return () => {
      unsubscribe?.();
    };
  }, [setUser, setLoading, fetchWishlist, clearWishlist]);
}
