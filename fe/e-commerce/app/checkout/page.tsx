"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, MapPin, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCart } from "@/lib/hooks/use-cart";
import { useCheckout } from "@/lib/hooks/use-checkout";
import { checkoutFormSchema, type CheckoutForm } from "@/lib/types/order";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading } = useCart();
  const checkout = useCheckout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
  });

  function onSubmit(form: CheckoutForm) {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    checkout.mutate(
      { form, cart },
      {
        onSuccess: (order) => {
          toast.success("Order placed successfully!");
          router.push(`/order-confirmation?orderId=${order.id}`);
        },
        onError: (err: unknown) => {
          const msg =
            typeof err === "object" && err !== null && "error" in err
              ? (err as { error: string }).error
              : "Could not place order. Please try again.";
          toast.error(msg);
        },
      }
    );
  }

  if (cartLoading) return <CheckoutSkeleton />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm font-semibold text-gray-900">
          Your cart is empty
        </p>
        <Link
          href="/"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            href="/cart"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base font-bold text-gray-900">Checkout</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
            <Lock size={12} />
            Secure checkout
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6 lg:grid-cols-[1fr_360px]"
        >
          {/* Left: Form */}
          <div className="space-y-5">
            {/* Shipping */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900">
                  <MapPin size={13} className="text-white" />
                </div>
                <h2 className="font-bold text-gray-900">Shipping Address</h2>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="First name"
                    error={errors.firstName?.message}
                    {...register("firstName")}
                    placeholder="Jane"
                  />
                  <Field
                    label="Last name"
                    error={errors.lastName?.message}
                    {...register("lastName")}
                    placeholder="Doe"
                  />
                </div>
                <Field
                  label="Email"
                  error={errors.email?.message}
                  {...register("email")}
                  type="email"
                  placeholder="jane@example.com"
                />
                <Field
                  label="Phone"
                  error={errors.phone?.message}
                  {...register("phone")}
                  type="tel"
                  placeholder="+1 555 000 1234"
                />
                <Field
                  label="Address"
                  error={errors.address?.message}
                  {...register("address")}
                  placeholder="123 Main St"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="City"
                    error={errors.city?.message}
                    {...register("city")}
                    placeholder="New York"
                  />
                  <Field
                    label="State"
                    error={errors.state?.message}
                    {...register("state")}
                    placeholder="NY"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="ZIP code"
                    error={errors.zip?.message}
                    {...register("zip")}
                    placeholder="10001"
                  />
                  <Field
                    label="Country"
                    error={errors.country?.message}
                    {...register("country")}
                    placeholder="US"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900">
                  <CreditCard size={13} className="text-white" />
                </div>
                <h2 className="font-bold text-gray-900">Payment</h2>
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  Demo — any card works
                </span>
              </div>

              <div className="grid gap-4">
                <Field
                  label="Card number"
                  error={errors.cardNumber?.message}
                  {...register("cardNumber")}
                  placeholder="4111 1111 1111 1111"
                  maxLength={19}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Expiry (MM/YY)"
                    error={errors.cardExpiry?.message}
                    {...register("cardExpiry")}
                    placeholder="12/26"
                    maxLength={5}
                  />
                  <Field
                    label="CVC"
                    error={errors.cardCvc?.message}
                    {...register("cardCvc")}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </section>

            {/* Place order (mobile — shows above summary on small screens) */}
            <div className="lg:hidden">
              <PlaceOrderButton loading={checkout.isPending} />
            </div>
          </div>

          {/* Right: Summary + Place order */}
          <div className="flex flex-col gap-4">
            <div className="lg:sticky lg:top-24">
              <OrderSummary cart={cart} />
              <div className="mt-4 hidden lg:block">
                <PlaceOrderButton loading={checkout.isPending} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────

import { forwardRef } from "react";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-gray-700">{label}</Label>
      <Input
        ref={ref}
        className={`rounded-xl text-sm ${error ? "border-red-400 focus-visible:ring-red-300" : "border-gray-200"}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

// ── Place order button ────────────────────────────────────────────────────

function PlaceOrderButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Placing order…
        </>
      ) : (
        <>
          <Lock size={14} />
          Place Order
        </>
      )}
    </button>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <div className="h-16 border-b bg-white" />
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
