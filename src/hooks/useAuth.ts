import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase.ts';
import { useAuthStore } from '@/store/auth.ts';
import { useWishlistStore } from '@/store/wishlist.ts';
import { mapFirebaseUser } from '@/services/auth.ts';
import { createUserProfile, getUserProfile } from '@/services/firestore.ts';

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = mapFirebaseUser(firebaseUser);
        // Create Firestore profile if first login
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
    return unsubscribe;
  }, [setUser, setLoading, fetchWishlist, clearWishlist]);
}
