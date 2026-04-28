"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart } from "@/lib/hooks/use-cart";
import { formatPrice } from "@/lib/utils/currency";
import { getInventoryStatus, isOutOfStock } from "@/lib/utils/inventory";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useAddToCart();
  const status = getInventoryStatus(product.inventory);
  const oos = isOutOfStock(product.inventory);

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (oos) return;
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () =>
          toast.success(`${product.name} added to cart`),
        onError: (err: unknown) => {
          const msg =
            typeof err === "object" && err !== null && "error" in err
              ? (err as { error: string }).error
              : "Could not add to cart";
          toast.error(msg);
        },
      }
    );
  }

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Wishlist */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-red-500 group-hover:opacity-100"
          aria-label="Add to wishlist"
        >
          <Heart size={14} />
        </button>

        {/* Badges — stacked vertically so they never overlap */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {status === "out_of_stock" && (
            <Badge className="rounded-full bg-red-500 text-xs font-semibold text-white">
              Out of stock
            </Badge>
          )}
          {status === "low_stock" && (
            <Badge className="rounded-full bg-amber-400 text-xs font-semibold text-gray-900">
              Only {product.inventory} left
            </Badge>
          )}
          {product.tags?.includes("new") && status !== "out_of_stock" && (
            <Badge className="rounded-full bg-indigo-500 text-xs font-semibold text-white">
              New
            </Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          {product.category}
        </p>
        <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-gray-900">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          {/* Price pill */}
          <span className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white">
            {formatPrice(product.price)}
          </span>

          {/* Quick add */}
          <button
            onClick={handleAdd}
            disabled={oos || addToCart.isPending}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
              oos
                ? "cursor-not-allowed bg-gray-100 text-gray-300"
                : "bg-[var(--brand-green)] text-white hover:bg-[var(--brand-green-dark)] hover:shadow-sm active:scale-95"
            )}
            aria-label={oos ? "Out of stock" : "Add to cart"}
          >
            {addToCart.isPending ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4">
        <Skeleton className="mb-2 h-3 w-16 rounded-full" />
        <Skeleton className="mb-3 h-4 w-3/4 rounded-lg" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
