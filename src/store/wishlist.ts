import { create } from 'zustand';
import {
  getWishlist,
  addToWishlist as addToWishlistDB,
  removeFromWishlist as removeFromWishlistDB,
} from '@/services/firestore.ts';

interface WishlistState {
  items: Set<string>;
  isLoaded: boolean;

  /** Fetch wishlist from Firestore for logged-in user */
  fetchWishlist: (uid: string) => Promise<void>;

  /** Toggle a product in the wishlist (add if absent, remove if present) */
  toggle: (uid: string, productId: string) => Promise<void>;

  /** Check if a product is in the wishlist */
  has: (productId: string) => boolean;

  /** Clear local state on logout */
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: new Set<string>(),
  isLoaded: false,

  fetchWishlist: async (uid) => {
    try {
      const list = await getWishlist(uid);
      set({ items: new Set(list.map((i) => i.productId)), isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  toggle: async (uid, productId) => {
    const { items } = get();
    const next = new Set(items);

    if (next.has(productId)) {
      next.delete(productId);
      set({ items: next });
      await removeFromWishlistDB(uid, productId).catch(() => {
        // rollback on error
        const rollback = new Set(get().items);
        rollback.add(productId);
        set({ items: rollback });
      });
    } else {
      next.add(productId);
      set({ items: next });
      await addToWishlistDB(uid, productId).catch(() => {
        // rollback on error
        const rollback = new Set(get().items);
        rollback.delete(productId);
        set({ items: rollback });
      });
    }
  },

  has: (productId) => get().items.has(productId),

  clear: () => set({ items: new Set(), isLoaded: false }),
}));
