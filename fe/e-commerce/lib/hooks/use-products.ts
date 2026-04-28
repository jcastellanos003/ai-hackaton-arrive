"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories } from "@/lib/api/products-service";
import { queryKeys } from "@/lib/constants/query-keys";
import type { ProductFilters } from "@/lib/types/product";

const FIVE_MIN = 1000 * 60 * 5;

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: FIVE_MIN,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });
}
