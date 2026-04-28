"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useCart } from "@/lib/hooks/use-cart";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base font-bold text-gray-900">
            Cart{" "}
            {!isLoading && cart && cart.items.length > 0 && (
              <span className="ml-1 text-sm font-normal text-gray-500">
                ({cart.items.length}{" "}
                {cart.items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        {isLoading ? (
          <CartSkeleton />
        ) : !cart || cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <CartSummary cart={cart} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
