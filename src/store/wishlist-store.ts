import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface WishlistState {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),
      removeFromWishlist: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        })),
      toggleWishlist: (item) => {
        const isIn = get().items.some((i) => i.id === item.id);
        if (isIn) {
          get().removeFromWishlist(item.id);
        } else {
          get().addToWishlist(item);
        }
      },
      isInWishlist: (id) => get().items.some((i) => i.id === id)
    }),
    {
      name: "sellokart-wishlist-storage"
    }
  )
);
