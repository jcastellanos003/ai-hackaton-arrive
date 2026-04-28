"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Home,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/lib/hooks/use-checkout";
import { formatPrice } from "@/lib/utils/currency";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const { data: order, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-64 rounded-xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm font-semibold text-gray-900">
          Could not load your order
        </p>
        <Link
          href="/"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Go home
        </Link>
      </div>
    );
  }

  const deliveryDate = new Date(order.estimatedDelivery).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric" }
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
      {/* Success header */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Order Confirmed!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thanks! We&apos;ve received your order and are getting it ready.
          </p>
        </div>
        <div className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-bold text-gray-900">
          #{order.orderNumber}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <Step icon={CheckCircle2} label="Confirmed" done />
        <div className="h-px flex-1 bg-gray-200" />
        <Step icon={Package} label="Preparing" done />
        <div className="h-px flex-1 bg-gray-200" />
        <Step icon={Truck} label="On the way" />
      </div>

      {/* Estimated delivery */}
      <div className="mb-6 rounded-2xl border border-[var(--brand-green)]/30 bg-emerald-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Truck size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Estimated Delivery
            </p>
            <p className="font-bold text-gray-900">{deliveryDate}</p>
          </div>
        </div>
      </div>

      {/* Order details */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-900">Order Details</h2>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={item.productImage}
                  alt={item.productName}
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
                  {item.productName}
                </p>
                <p className="text-xs text-gray-400">
                  {formatPrice(item.price)} each
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes</span>
            <span>{formatPrice(order.taxes)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className={order.shipping === 0 ? "font-semibold text-emerald-600" : ""}>
              {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">Total paid</span>
            <span className="text-lg font-black text-gray-900">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          Confirmation sent to{" "}
          <span className="font-semibold text-gray-900">{order.email}</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          disabled
          className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-400 shadow-sm"
        >
          <Truck size={15} />
          Track order
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
            Coming soon
          </span>
        </button>
        <Link
          href="/"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-green)] py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--brand-green-dark)] hover:shadow-md active:scale-[0.98]"
        >
          <Home size={15} />
          Continue shopping
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function Step({
  icon: Icon,
  label,
  done = false,
}: {
  icon: React.ElementType;
  label: string;
  done?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          done ? "bg-emerald-100" : "bg-gray-100"
        }`}
      >
        <Icon
          size={15}
          className={done ? "text-emerald-500" : "text-gray-400"}
        />
      </div>
      <span className={`text-xs font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          </div>
        }
      >
        <OrderConfirmationContent />
      </Suspense>
    </div>
  );
}
