import { MOCK_PRODUCTS } from "./mock-data";
import type { Cart, CartItem } from "@/lib/types/cart";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function randomDelay() {
  return delay(400 + Math.random() * 400);
}

// Module-level in-memory cart state (persists for the session)
const cartItems: Map<string, number> = new Map();

function computeCart(): Cart {
  const items: CartItem[] = [];

  for (const [productId, quantity] of cartItems.entries()) {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (product && quantity > 0) {
      items.push({ productId, product, quantity });
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const taxes = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = Math.round((subtotal + taxes + shipping) * 100) / 100;

  return {
    id: "mock-cart",
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    taxes,
    shipping,
    total,
  };
}

export async function mockGetCart(): Promise<Cart> {
  await randomDelay();
  return computeCart();
}

export async function mockAddToCart(
  productId: string,
  quantity: number
): Promise<Cart> {
  await randomDelay();
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) throw { error: "Product not found", code: "PRODUCT_NOT_FOUND" };

  const current = cartItems.get(productId) ?? 0;
  const next = current + quantity;

  if (next > product.inventory) {
    throw {
      error: `Only ${product.inventory - current} items left in stock`,
      code: "INSUFFICIENT_INVENTORY",
    };
  }

  cartItems.set(productId, next);
  return computeCart();
}

export async function mockUpdateCartItem(
  productId: string,
  quantity: number
): Promise<Cart> {
  await randomDelay();
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) throw { error: "Product not found", code: "PRODUCT_NOT_FOUND" };

  if (!cartItems.has(productId)) {
    throw { error: "Item not in cart", code: "CART_ITEM_NOT_FOUND" };
  }

  if (quantity > product.inventory) {
    throw {
      error: `Only ${product.inventory} items left in stock`,
      code: "INSUFFICIENT_INVENTORY",
    };
  }

  if (quantity <= 0) {
    cartItems.delete(productId);
  } else {
    cartItems.set(productId, quantity);
  }

  return computeCart();
}

export async function mockRemoveFromCart(productId: string): Promise<Cart> {
  await randomDelay();
  cartItems.delete(productId);
  return computeCart();
}

export async function mockClearCart(): Promise<{ message: string }> {
  await randomDelay();
  cartItems.clear();
  return { message: "Cart cleared" };
}
