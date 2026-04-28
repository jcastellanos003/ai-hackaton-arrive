"use client";

import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { ShoppingBag, RefreshCw } from "lucide-react";
import type { Product } from "@/lib/types/product";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  onRetry,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <RefreshCw size={24} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">
            Something went wrong
          </p>
          <p className="mt-1 text-xs text-gray-500">
            We couldn&apos;t load the products
          </p>
        </div>
        <button
          onClick={onRetry}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
          <ShoppingBag size={24} className="text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">
            No products found
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Try a different category or search term
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
