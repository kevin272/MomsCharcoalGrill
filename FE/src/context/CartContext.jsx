import React, { createContext, useContext, useState } from 'react';

/**
 * A simple cart context to share cart state across the app.
 *
 * This provider stores an array of items where each item is expected to
 * contain at minimum a `menuItem` (the backend MenuItem _id), `id` (a local
 * identifier), `name`, `price`, `quantity` and `image`.  Consumers can
 * add, update and remove items via the provided helpers.  The context
 * also exposes a `clearCart` function for resetting the cart on successful
 * checkout.
 */
const CartContext = createContext({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

/**
 * Hook to consume the cart context.  Throws if used outside of a provider.
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}

/**
 * Provides cart state to the app.  Wrap your application in this provider
 * (see `src/main.jsx`) to make the cart available.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}