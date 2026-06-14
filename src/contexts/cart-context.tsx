"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getLocalCart(): CartItem[] {
  try {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setLocalCart(items: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [synced, setSynced] = useState(false);
  const { user } = useUser();
  const supabase = useRef(createClient());
  const prevUser = useRef(user);

  useEffect(() => {
    setItems(getLocalCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setLocalCart(items);
  }, [items, loaded]);

  const syncToBackend = useCallback(async (currentItems: CartItem[]) => {
    if (!user) return;
    const payload = currentItems.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
    }));
    await supabase.current.from("carts").upsert(payload, {
      onConflict: "user_id, product_id",
      ignoreDuplicates: false,
    });
    const productIds = currentItems.map((i) => i.product.id);
    if (productIds.length > 0) {
      await supabase.current
        .from("carts")
        .delete()
        .eq("user_id", user.id)
        .not("product_id", "in", `(${productIds.join(",")})`);
    } else {
      await supabase.current.from("carts").delete().eq("user_id", user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (prevUser.current && loaded) {
        setItems(getLocalCart());
      }
      prevUser.current = user;
      return;
    }

    prevUser.current = user;

    if (synced) return;

    (async () => {
      const { data: remoteItems } = await supabase.current
        .from("carts")
        .select("product_id, quantity")
        .eq("user_id", user.id);

      if (!remoteItems || remoteItems.length === 0) {
        setSynced(true);
        return;
      }

      const local = getLocalCart();
      const merged = [...local];
      const missingIds: string[] = [];

      for (const r of remoteItems) {
        const existing = merged.find((m) => m.product.id === r.product_id);
        if (existing) {
          existing.quantity = Math.max(existing.quantity, r.quantity);
        } else {
          merged.push({ product: { id: r.product_id } as Product, quantity: r.quantity });
          missingIds.push(r.product_id);
        }
      }

      if (missingIds.length === 0) {
        setItems(merged);
        setLocalCart(merged);
        setSynced(true);
        return;
      }

      const { data: products } = await supabase.current
        .from("products")
        .select("id, name, price, image_url, stock")
        .in("id", missingIds);

      if (products) {
        const hydrated = merged.map((m) => {
          if (m.product.name) return m;
          const p = products.find((pr) => pr.id === m.product.id);
          return p ? { product: p as Product, quantity: m.quantity } : null;
        }).filter(Boolean) as CartItem[];
        setItems(hydrated);
        setLocalCart(hydrated);
      }

      setSynced(true);
    })();
  }, [user, loaded, synced]);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    syncToBackend(newItems);
  }, [syncToBackend]);

  const addItem = useCallback((product: Product) => {
    persist(
      (() => {
        const prev = getLocalCart();
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          if (existing.quantity >= product.stock) return prev;
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        if (product.stock <= 0) return prev;
        return [...prev, { product, quantity: 1 }];
      })()
    );
  }, [persist]);

  const removeItem = useCallback((productId: string) => {
    persist(getLocalCart().filter((i) => i.product.id !== productId));
  }, [persist]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      persist(getLocalCart().filter((i) => i.product.id !== productId));
      return;
    }
    persist(
      getLocalCart().map((i) => {
        if (i.product.id !== productId) return i;
        return { ...i, quantity: Math.min(quantity, i.product.stock) };
      })
    );
  }, [persist]);

  const clearCart = useCallback(() => {
    persist([]);
    if (user) {
      supabase.current.from("carts").delete().eq("user_id", user.id);
    }
  }, [persist, user]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
