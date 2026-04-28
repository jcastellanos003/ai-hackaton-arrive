import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils/currency";
import type { Cart } from "@/lib/types/cart";

interface CartSummaryProps {
  cart: Cart;
  showCheckout?: boolean;
}

export function CartSummary({ cart, showCheckout = true }: CartSummaryProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Order Summary</h2>

      <div className="space-y-3">
        <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
        <Row label="Taxes (8%)" value={formatPrice(cart.taxes)} />
        <Row
          label="Shipping"
          value={cart.shipping === 0 ? "Free" : formatPrice(cart.shipping)}
          valueClass={cart.shipping === 0 ? "text-emerald-600 font-semibold" : ""}
        />
        {cart.subtotal < 100 && (
          <p className="text-xs text-gray-500">
            Add {formatPrice(100 - cart.subtotal)} more for free shipping
          </p>
        )}

        <Separator />

        <Row
          label="Total"
          value={formatPrice(cart.total)}
          labelClass="font-bold text-gray-900"
          valueClass="text-lg font-black text-gray-900"
        />
      </div>

      {showCheckout && (
        <Link
          href="/checkout"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md active:scale-[0.98]"
        >
          Proceed to checkout
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  labelClass = "text-gray-600",
  valueClass = "text-gray-900",
}: {
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={labelClass}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
