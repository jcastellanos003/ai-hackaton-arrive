import type { ProductFilters } from "@/lib/types/product";

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters?: ProductFilters) =>
      ["products", "list", filters ?? {}] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    related: (id: string, category: string) =>
      ["products", "related", id, category] as const,
    categories: ["products", "categories"] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  orders: {
    detail: (id: string) => ["orders", "detail", id] as const,
  },
} as const;
