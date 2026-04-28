import { apiClient } from "./api-client";
import type {
  Product,
  ProductFilters,
  ProductsResponse,
  Category,
} from "@/lib/types/product";

export async function getProducts(
  filters?: ProductFilters
): Promise<ProductsResponse> {
  return apiClient.get<ProductsResponse>("products", filters);
}

export async function getProductById(id: string): Promise<Product> {
  return apiClient.get<Product>(`products/${id}`);
}

export async function getRelatedProducts(
  productId: string,
): Promise<{ data: Product[] }> {
  return apiClient.get<{ data: Product[] }>(`products/${productId}/related`);
}

export async function getCategories(): Promise<{ data: Category[] }> {
  return apiClient.get<{ data: Category[] }>("products/categories");
}
