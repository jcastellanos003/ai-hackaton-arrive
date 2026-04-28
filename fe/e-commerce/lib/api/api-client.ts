/**
 * Central API client. Checks NEXT_PUBLIC_USE_MOCKS or absence of NEXT_PUBLIC_API_URL
 * to decide whether to route calls to the mock layer or the real backend.
 * Services never know which path is taken — they only call apiClient methods.
 */

import type { ProductFilters, ProductsResponse, Category } from "@/lib/types/product";
import type { Cart } from "@/lib/types/cart";
import type { Order, CheckoutForm } from "@/lib/types/order";

const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Real fetch helpers ──────────────────────────────────────────────────────

async function realRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${BASE_URL}/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw err;
  }

  return res.json() as Promise<T>;
}

// ── Mock dispatch helpers ───────────────────────────────────────────────────

async function mockDispatch<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const {
    mockGetProducts,
    mockGetProductById,
    mockGetRelatedProducts,
    mockGetCategories,
  } = await import("./mock/mock-products");
  const {
    mockGetCart,
    mockAddToCart,
    mockUpdateCartItem,
    mockRemoveFromCart,
    mockClearCart,
  } = await import("./mock/mock-cart");
  const { mockPlaceOrder, mockGetOrder } = await import("./mock/mock-orders");

  // Products
  if (method === "GET" && path.startsWith("products/categories")) {
    return mockGetCategories() as Promise<T>;
  }
  const relatedMatch = path.match(/^products\/([^/]+)\/related$/);
  if (method === "GET" && relatedMatch) {
    const id = relatedMatch[1];
    // category unknown at dispatch level — fetch product first
    const product = await mockGetProductById(id);
    return mockGetRelatedProducts(id, product.category) as Promise<T>;
  }
  const productByIdMatch = path.match(/^products\/([^/]+)$/);
  if (method === "GET" && productByIdMatch) {
    return mockGetProductById(productByIdMatch[1]) as Promise<T>;
  }
  if (method === "GET" && path.startsWith("products")) {
    const params = body as ProductFilters | undefined;
    return mockGetProducts(params) as Promise<T>;
  }

  // Cart
  if (method === "GET" && path === "cart") {
    return mockGetCart() as Promise<T>;
  }
  if (method === "POST" && path === "cart/items") {
    const { productId, quantity } = body as { productId: string; quantity: number };
    return mockAddToCart(productId, quantity) as Promise<T>;
  }
  if (method === "PATCH" && path.startsWith("cart/items/")) {
    const productId = path.replace("cart/items/", "");
    const { quantity } = body as { quantity: number };
    return mockUpdateCartItem(productId, quantity) as Promise<T>;
  }
  if (method === "DELETE" && path.startsWith("cart/items/")) {
    const productId = path.replace("cart/items/", "");
    return mockRemoveFromCart(productId) as Promise<T>;
  }
  if (method === "DELETE" && path === "cart") {
    return mockClearCart() as Promise<T>;
  }

  // Orders
  if (method === "POST" && path === "orders") {
    const { form, cart } = body as { form: CheckoutForm; cart: Cart };
    return mockPlaceOrder(form, cart) as Promise<T>;
  }
  const orderByIdMatch = path.match(/^orders\/([^/]+)$/);
  if (method === "GET" && orderByIdMatch) {
    return mockGetOrder(orderByIdMatch[1]) as Promise<T>;
  }

  throw new Error(`[mock] Unhandled: ${method} ${path}`);
}

// ── Public API client ───────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, params?: unknown, headers?: Record<string, string>) =>
    USE_MOCK
      ? mockDispatch<T>("GET", path, params)
      : realRequest<T>("GET", path, undefined, headers),

  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    USE_MOCK
      ? mockDispatch<T>("POST", path, body)
      : realRequest<T>("POST", path, body, headers),

  patch: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    USE_MOCK
      ? mockDispatch<T>("PATCH", path, body)
      : realRequest<T>("PATCH", path, body, headers),

  delete: <T>(path: string, headers?: Record<string, string>) =>
    USE_MOCK
      ? mockDispatch<T>("DELETE", path)
      : realRequest<T>("DELETE", path, undefined, headers),
};

export { USE_MOCK };
