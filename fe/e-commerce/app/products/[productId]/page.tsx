"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useRelatedProducts } from "@/lib/hooks/use-product";
import { useCart, useAddToCart } from "@/lib/hooks/use-cart";
import { formatPrice } from "@/lib/utils/currency";
import {
  getInventoryStatus,
  isOutOfStock,
  canAddToCart,
} from "@/lib/utils/inventory";
import { ProductCard } from "@/components/products/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = String(params.productId);

  const { data: product, isLoading, isError } = useProduct(productId);
  const { data: cart } = useCart();
  const addToCart = useAddToCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: relatedData } = useRelatedProducts(
    productId,
    product?.category ?? ""
  );
  const related = relatedData?.data ?? [];

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm font-semibold text-gray-900">Product not found</p>
        <Link
          href="/"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const status = getInventoryStatus(product.inventory);
  const oos = isOutOfStock(product.inventory);
  const cartQty =
    cart?.items.find((i) => i.productId === productId)?.quantity ?? 0;
  const canAdd = canAddToCart(product.inventory, cartQty, quantity);

  function handleAdd() {
    if (!canAdd) return;
    addToCart.mutate(
      { productId: product!.id, quantity },
      {
        onSuccess: () =>
          toast.success(`${quantity}× ${product!.name} added to cart`),
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
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Top nav */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">
              Products
            </Link>{" "}
            / {product.name}
          </span>
          <Link
            href="/cart"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
          >
            <ShoppingCart size={18} />
            {cartQty > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-green)] text-[10px] font-bold text-white">
                {cartQty}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <button className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500">
                <Heart size={16} />
              </button>
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === i
                        ? "border-gray-900"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            {/* Category + tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {product.category}
              </span>
              {product.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full text-xs capitalize"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            {product.rating !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(product.rating!)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-gray-900">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Description */}
            <p className="leading-relaxed text-gray-600">{product.description}</p>

            {/* Inventory status */}
            <div>
              {status === "out_of_stock" && (
                <Badge className="rounded-full bg-red-500 text-xs font-semibold text-white">
                  Out of stock
                </Badge>
              )}
              {status === "low_stock" && (
                <Badge className="rounded-full bg-amber-400 text-xs font-semibold text-gray-900">
                  Only {product.inventory} left — order soon
                </Badge>
              )}
              {status === "in_stock" && (
                <Badge className="rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  In stock
                </Badge>
              )}
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:text-gray-300"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.inventory - cartQty, q + 1)
                    )
                  }
                  disabled={!canAddToCart(product.inventory, cartQty, quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:text-gray-300"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                disabled={oos || !canAdd || addToCart.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                {addToCart.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ShoppingCart size={16} />
                )}
                {oos ? "Out of stock" : "Add to cart"}
              </button>
            </div>

            {!canAdd && !oos && (
              <p className="text-xs text-amber-600">
                Only {product.inventory - cartQty} more available
              </p>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              More from {product.category}
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-2">
              {related.map((p) => (
                <div key={p.id} className="w-56 shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <div className="h-16 border-b bg-white" />
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
