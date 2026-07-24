import { createContext, useContext, useState, type ReactNode } from "react";
import { useProducts } from "./store";

export type CartItem = { productId: string; size: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (productId: string, size: string) => void;
  remove: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  subtotal: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const products = useProducts();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  const add = (productId: string, size: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId && i.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { productId, size, qty: 1 }];
    });
    setOpen(true);
  };

  const remove = (productId: string, size: string) =>
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));

  const updateQty = (productId: string, size: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId && i.size === size ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
    );

  const subtotal = items.reduce((sum, i) => {
    const p = products.find((product) => product.id === i.productId);
    return p ? sum + p.price * i.qty : sum;
  }, 0);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider
      value={{
        items,
        add,
        remove,
        updateQty,
        clear: () => setItems([]),
        isOpen,
        open: () => setOpen(true),
        close: () => setOpen(false),
        subtotal,
        count,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be within CartProvider");
  return c;
};
