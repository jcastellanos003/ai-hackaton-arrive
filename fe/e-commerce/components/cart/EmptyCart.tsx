import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl bg-white py-20 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
        <ShoppingCart size={28} className="text-gray-300" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">
          Your cart is empty
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Add some products and they&apos;ll show up here
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-green)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--brand-green-dark)] hover:shadow-md active:scale-95"
      >
        Start shopping
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
