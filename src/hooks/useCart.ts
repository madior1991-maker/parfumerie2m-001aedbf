import { useCallback, useEffect, useMemo, useState } from "react";

const CART_KEY = "2m-cart";
const CART_EVENT = "2m-cart-updated";

export type CartItem = {
  id: string;
  name: string;
  collection: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(CART_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
    const sync = () => setItems(readCart());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const commit = useCallback((next: CartItem[]) => {
    setItems(next);
    if (typeof window !== "undefined") writeCart(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const current = readCart();
      const existing = current.find((cartItem) => cartItem.id === item.id);
      const next = existing
        ? current.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: Math.min(10, cartItem.quantity + (item.quantity ?? 1)) }
              : cartItem,
          )
        : [...current, { ...item, quantity: Math.min(10, item.quantity ?? 1) }];
      commit(next);
    },
    [commit],
  );

  const removeItem = useCallback(
    (id: string) => commit(readCart().filter((item) => item.id !== id)),
    [commit],
  );
  const updateQuantity = useCallback(
    (id: string, quantity: number) =>
      commit(
        readCart().map((item) =>
          item.id === id ? { ...item, quantity: Math.min(10, Math.max(1, quantity)) } : item,
        ),
      ),
    [commit],
  );
  const clearCart = useCallback(() => commit([]), [commit]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount };
}
