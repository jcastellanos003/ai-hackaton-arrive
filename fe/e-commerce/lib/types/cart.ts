import type { Product } from "./product";

export type CartItem = {
  productId: string;
  product: Product;
  quantity: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
};
