/**
 * Central API client. Checks NEXT_PUBLIC_USE_MOCKS or absence of NEXT_PUBLIC_API_URL
 * to decide whether to route calls to the mock layer or the real backend.
 * Services never know which path is taken — they only call apiClient methods.
 */

import type { OrderBody } from "./mock/mock-orders";

const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** camelCase → snake_case for query param keys */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Converts a params object to a URLSearchParams, mapping keys to snake_case */
function buildQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      qs.set(toSnakeCase(key), String(val));
    }
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// ── Real fetch ───────────────────────────────────────────────────────────────

async function realRequest<T>(
  method: string,
  path: string,
  params?: Record<string, unknown>,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const qs =
    method === "GET" && params ? buildQueryString(params) : "";
  const url = `${BASE_URL}/${path}${qs}`;

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

// ── Mock dispatch ────────────────────────────────────────────────────────────

async function mockDispatch<T>(
  method: string,
  path: string,
  params?: Record<string, unknown>,
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

  // Products — order matters: categories and related must come before :id
  if (method === "GET" && path === "products/categories") {
    return mockGetCategories() as Promise<T>;
  }
  const relatedMatch = path.match(/^products\/([^/]+)\/related$/);
  if (method === "GET" && relatedMatch) {
    const id = relatedMatch[1];
    const product = await mockGetProductById(id);
    return mockGetRelatedProducts(id, product.category) as Promise<T>;
  }
  const productByIdMatch = path.match(/^products\/([^/]+)$/);
  if (method === "GET" && productByIdMatch) {
    return mockGetProductById(productByIdMatch[1]) as Promise<T>;
  }
  if (method === "GET" && path === "products") {
    return mockGetProducts(params as Parameters<typeof mockGetProducts>[0]) as Promise<T>;
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

  // Orders — mock reads its own cart state internally (mirrors real BE behaviour)
  if (method === "POST" && path === "orders") {
    const cart = await mockGetCart();
    return mockPlaceOrder(body as OrderBody, cart) as Promise<T>;
  }
  const orderByIdMatch = path.match(/^orders\/([^/]+)$/);
  if (method === "GET" && orderByIdMatch) {
    return mockGetOrder(orderByIdMatch[1]) as Promise<T>;
  }

  throw new Error(`[mock] Unhandled: ${method} ${path}`);
}

// ── Public API client ────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(
    path: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) =>
    USE_MOCK
      ? mockDispatch<T>("GET", path, params)
      : realRequest<T>("GET", path, params, undefined, headers),

  post: <T>(
    path: string,
    body: unknown,
    headers?: Record<string, string>
  ) =>
    USE_MOCK
      ? mockDispatch<T>("POST", path, undefined, body)
      : realRequest<T>("POST", path, undefined, body, headers),

  patch: <T>(
    path: string,
    body: unknown,
    headers?: Record<string, string>
  ) =>
    USE_MOCK
      ? mockDispatch<T>("PATCH", path, undefined, body)
      : realRequest<T>("PATCH", path, undefined, body, headers),

  delete: <T>(
    path: string,
    headers?: Record<string, string>
  ) =>
    USE_MOCK
      ? mockDispatch<T>("DELETE", path)
      : realRequest<T>("DELETE", path, undefined, undefined, headers),
};

export { USE_MOCK };
