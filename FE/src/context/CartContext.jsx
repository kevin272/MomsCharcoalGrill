// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from '../components/common/ToastProvider';
const STORAGE_KEY = 'mcg_cart_v1';
const CartContext = createContext({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export function useCart() {

  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const toast = useToast();

  const [items, setItems] = useState(() => loadFromStorage());

  // persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
      
    });
    const niceName = item?.name || item?.title || "Item";
    toast.success(`${niceName} added to cart`);
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id, qty) => {
    if (qty <= 0) removeFromCart(id);
    else setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const clearCart = () => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const value = useMemo(() => ({
    items, addToCart, removeFromCart, updateQuantity, clearCart,
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
