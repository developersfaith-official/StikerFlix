// src/hooks/useCart.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: number;
  quantity: number;
}

const STORAGE_KEY = 'stickerflix_cart';
const CART_EVENT = 'stickerflix-cart-updated';

const readStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCart(readStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      // Notify other components in the same tab
      window.dispatchEvent(new Event(CART_EVENT));
    } catch {
      /* ignore quota errors */
    }
  }, [cart, hydrated]);

  // Stay in sync with other tabs / other hook instances.
  // Important: we must bail out when storage matches current state, otherwise
  // our own write → event → setCart(new ref) → write → ... loops forever.
  useEffect(() => {
    const sync = () => {
      const fresh = readStorage();
      setCart((prev) => {
        if (
          prev.length === fresh.length &&
          prev.every(
            (item, i) =>
              item.id === fresh[i].id && item.quantity === fresh[i].quantity
          )
        ) {
          return prev; // same content → return same ref so React bails out
        }
        return fresh;
      });
    };
    window.addEventListener('storage', sync);
    window.addEventListener(CART_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CART_EVENT, sync);
    };
  }, []);

  const addToCart = useCallback((id: number, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const increaseQuantity = useCallback((id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((id: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isInCart = useCallback(
    (id: number) => cart.some((item) => item.id === id),
    [cart]
  );

  const getQuantity = useCallback(
    (id: number) => cart.find((item) => item.id === id)?.quantity ?? 0,
    [cart]
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    hydrated,
    totalItems,
    isInCart,
    getQuantity,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
  };
};
