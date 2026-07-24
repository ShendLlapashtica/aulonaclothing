import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Order, Product, ShippingCountry, ShippingRate } from "./products";

// --- WhatsApp business number for order redirection ---
export const WHATSAPP_NUMBER = "38344123456"; // +383 44 123 456 (Kosovo)
export const WHATSAPP_DISPLAY = "+383 44 123 456";

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  sizes: string[];
  image: string;
  stock: number;
  is_new: boolean;
  on_sale: boolean;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    sizes: row.sizes,
    image: row.image,
    stock: row.stock,
    isNew: row.is_new,
    onSale: row.on_sale,
  };
}

function productToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    original_price: p.originalPrice ?? null,
    sizes: p.sizes,
    image: p.image,
    stock: p.stock,
    is_new: p.isNew ?? false,
    on_sale: p.onSale ?? false,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: fetchProducts,
});

export function useProducts(): Product[] {
  const { data } = useQuery(productsQueryOptions);
  return data ?? [];
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      const { error } = await supabase.from("products").insert(productToRow(product));
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useRemoveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ─────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => r.name);
}

export const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: fetchCategories,
});

export function useCategories(): string[] {
  const { data } = useQuery(categoriesQueryOptions);
  return data ?? [];
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("categories")
        .insert({ name: name.trim(), sort_order: Date.now() });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useRemoveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("categories").delete().eq("name", name);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ─────────────────────────────────────────────────────────────
// Shipping rates
// ─────────────────────────────────────────────────────────────

const DEFAULT_SHIPPING_RATES: Record<ShippingCountry, ShippingRate> = {
  XK: { country: "XK", label: "Kosovë", flag: "🇽🇰", price: 0 },
  AL: { country: "AL", label: "Shqipëri", flag: "🇦🇱", price: 5 },
  MK: { country: "MK", label: "Maqedonia e Veriut", flag: "🇲🇰", price: 5 },
};

async function fetchShippingRates(): Promise<ShippingRate[]> {
  const { data, error } = await supabase.from("shipping_rates").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    country: r.country as ShippingCountry,
    label: r.label,
    flag: r.flag,
    price: Number(r.price),
  }));
}

export const shippingRatesQueryOptions = queryOptions({
  queryKey: ["shipping-rates"],
  queryFn: fetchShippingRates,
});

/** Keyed by country, same shape the app used before the Supabase migration. */
export function useShippingRates(): Record<ShippingCountry, ShippingRate> {
  const { data } = useQuery(shippingRatesQueryOptions);
  if (!data || data.length === 0) return DEFAULT_SHIPPING_RATES;
  const record = {} as Record<ShippingCountry, ShippingRate>;
  for (const rate of data) record[rate.country] = rate;
  return record;
}

export function useUpdateShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ country, price }: { country: ShippingCountry; price: number }) => {
      const { error } = await supabase
        .from("shipping_rates")
        .update({ price })
        .eq("country", country);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shipping-rates"] }),
  });
}

// ─────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────

type OrderRow = {
  id: string;
  customer: string;
  country: string;
  items: number;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  date: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  payment_method: string | null;
  order_line_items: { name: string; size: string; qty: number; price: number }[];
};

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customer: row.customer,
    country: row.country as ShippingCountry,
    items: row.items,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: row.status,
    date: row.date,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    notes: row.notes ?? undefined,
    paymentMethod: (row.payment_method ?? undefined) as Order["paymentMethod"],
    lineItems: row.order_line_items,
  };
}

async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_line_items(name, size, qty, price)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

export const ordersQueryOptions = queryOptions({
  queryKey: ["orders"],
  queryFn: fetchOrders,
});

export function useOrders(): Order[] {
  const { data } = useQuery(ordersQueryOptions);
  return data ?? [];
}

export function useAddOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: Order) => {
      const { error: orderError } = await supabase.from("orders").insert({
        id: order.id,
        customer: order.customer,
        country: order.country,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        status: order.status,
        date: order.date,
        phone: order.phone ?? null,
        address: order.address ?? null,
        city: order.city ?? null,
        notes: order.notes ?? null,
        payment_method: order.paymentMethod ?? null,
      });
      if (orderError) throw orderError;

      if (order.lineItems && order.lineItems.length > 0) {
        const { error: lineItemsError } = await supabase.from("order_line_items").insert(
          order.lineItems.map((li) => ({
            order_id: order.id,
            name: li.name,
            size: li.size,
            qty: li.qty,
            price: li.price,
          })),
        );
        if (lineItemsError) throw lineItemsError;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}
