"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductById, getRelatedProducts } from "@/lib/api/products-service";
import { queryKeys } from "@/lib/constants/query-keys";

const FIVE_MIN = 1000 * 60 * 5;

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(id),
    staleTime: FIVE_MIN,
    enabled: Boolean(id),
  });
}

export function useRelatedProducts(productId: string, category: string) {
  return useQuery({
    queryKey: queryKeys.products.related(productId, category),
    queryFn: () => getRelatedProducts(productId),
    staleTime: FIVE_MIN,
    enabled: Boolean(productId) && Boolean(category),
  });
}
