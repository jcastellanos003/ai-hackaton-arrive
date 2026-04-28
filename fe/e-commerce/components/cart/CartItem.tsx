"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateCartItem, useRemoveFromCart } from "@/lib/hooks/use-cart";
import { formatPrice } from "@/lib/utils/currency";
import { canAddToCart } from "@/lib/utils/inventory";
import type { CartItem as CartItemType } from "@/lib/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const update = useUpdateCartItem();
  const remove = useRemoveFromCart();

  const { product, quantity, productId } = item;

  function handleQuantityChange(newQty: number) {
    if (newQty < 1) return;
    if (!canAddToCart(product.inventory, 0, newQty)) {
      toast.error(`Only ${product.inventory} items available`);
      return;
    }
    update.mutate(
      { productId, quantity: newQty },
      {
        onError: (err: unknown) => {
          const msg =
            typeof err === "object" && err !== null && "error" in err
              ? (err as { error: string }).error
              : "Could not update cart";
          toast.error(msg);
        },
      }
    );
  }

  function handleRemove() {
    remove.mutate(productId, {
      onSuccess: () => toast.success(`${product.name} removed`),
      onError: () => toast.error("Could not remove item"),
    });
  }

  const atMax = quantity >= product.inventory;

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {product.category}
        </p>
        <p className="font-semibold leading-tight text-gray-900">
          {product.name}
        </p>
        <p className="text-sm font-bold text-gray-900">
          {formatPrice(product.price * quantity)}
        </p>
        {atMax && (
          <p className="text-xs text-amber-600">
            Only {product.inventory} available
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end justify-between gap-2">
        {/* Remove */}
        <button
          onClick={handleRemove}
          disabled={remove.isPending}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Remove item"
        >
          <Trash2 size={14} />
        </button>

        {/* Stepper */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 p-1">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || update.isPending}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:text-gray-300"
          >
            <Minus size={12} />
          </button>
          <span className="w-7 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={atMax || update.isPending}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:text-gray-300"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
