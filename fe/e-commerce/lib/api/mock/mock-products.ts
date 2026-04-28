import { MOCK_PRODUCTS } from "./mock-data";
import type {
  Product,
  ProductFilters,
  ProductsResponse,
  Category,
} from "@/lib/types/product";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(400 + Math.random() * 400);
}

export async function mockGetProducts(
  filters?: ProductFilters
): Promise<ProductsResponse> {
  await randomDelay();

  let items = [...MOCK_PRODUCTS];

  if (filters?.category && filters.category !== "All") {
    items = items.filter((p) => p.category === filters.category);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (filters?.isFeatured !== undefined) {
    items = items.filter((p) => p.isFeatured === filters.isFeatured);
  }

  if (filters?.sort) {
    switch (filters.sort) {
      case "price_asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating_desc":
        items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }
  }

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages },
  };
}

export async function mockGetProductById(id: string): Promise<Product> {
  await randomDelay();
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error("Product not found");
  return product;
}

export async function mockGetRelatedProducts(
  productId: string,
  category: string
): Promise<{ data: Product[] }> {
  await randomDelay();
  const related = MOCK_PRODUCTS.filter(
    (p) => p.category === category && p.id !== productId
  ).slice(0, 4);
  return { data: related };
}

export async function mockGetCategories(): Promise<{ data: Category[] }> {
  await randomDelay();
  const counts: Record<string, number> = {};
  for (const p of MOCK_PRODUCTS) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  const data: Category[] = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
  }));
  return { data };
}
