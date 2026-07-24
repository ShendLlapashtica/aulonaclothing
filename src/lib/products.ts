export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  sizes: string[];
  images: string[];
  stock: number;
  isNew?: boolean;
  onSale?: boolean;
};

export type ShippingCountry = "XK" | "AL" | "MK";

export type ShippingRate = {
  country: ShippingCountry;
  label: string;
  flag: string;
  price: number;
};

export type Order = {
  id: string;
  customer: string;
  country: ShippingCountry;
  items: number;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  date: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  paymentMethod?: "cod" | "whatsapp";
  lineItems?: { name: string; size: string; qty: number; price: number }[];
};
