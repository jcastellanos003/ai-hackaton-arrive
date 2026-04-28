import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils/currency";
import type { Cart } from "@/lib/types/cart";

export function OrderSummary({ cart }: { cart: Cart }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-gray-900">Order Summary</h2>

      {/* Items */}
      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1">
              <p className="line-clamp-1 text-sm font-medium text-gray-900">
                {item.product.name}
              </p>
              <p className="text-xs text-gray-400">{item.product.category}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(item.product.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Taxes (8%)</span>
          <span>{formatPrice(cart.taxes)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={cart.shipping === 0 ? "font-semibold text-emerald-600" : ""}>
            {cart.shipping === 0 ? "Free" : formatPrice(cart.shipping)}
          </span>
        </div>

        <Separator />

        <div className="flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-lg font-black text-gray-900">
            {formatPrice(cart.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
