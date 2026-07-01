'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, CartItem } from '@/lib/mock-data';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, selectedOptions: Record<string, string>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to generate a unique item ID based on product ID and selected options
const generateItemId = (productId: string, options: Record<string, string>) => {
  const optionsString = Object.entries(options)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  return `${productId}-${optionsString}`;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shopping_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, selectedOptions: Record<string, string>) => {
    setItems(prev => {
      // Check if exact same product with same options exists
      const existingIndex = prev.findIndex(item => {
        if (item.product.id !== product.id) return false;
        
        // Compare options
        const prevOptions = item.selectedOptions || {};
        const newOptionsKeys = Object.keys(selectedOptions);
        const prevOptionsKeys = Object.keys(prevOptions);
        
        if (newOptionsKeys.length !== prevOptionsKeys.length) return false;
        return newOptionsKeys.every(key => selectedOptions[key] === prevOptions[key]);
      });

      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += 1;
        return newItems;
      }

      // Generate a unique ID for this cart item
      const newItemId = generateItemId(product.id, selectedOptions);
      return [...prev, { id: newItemId, product, quantity: 1, selectedOptions }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => {
      // Fallback for old items that didn't have an ID
      const currentId = (item as any).id || generateItemId(item.product.id, item.selectedOptions || {});
      return currentId !== itemId;
    }));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        const currentId = (item as any).id || generateItemId(item.product.id, item.selectedOptions || {});
        if (currentId === itemId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
