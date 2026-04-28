import { apiClient } from "./api-client";
import { getSessionId } from "@/lib/utils/session";
import type { Order, CheckoutForm } from "@/lib/types/order";

function sessionHeader(): Record<string, string> {
  return { "X-Session-ID": getSessionId() };
}

/**
 * Places an order. Sends { shipping, payment } as the spec requires.
 * The cart is resolved server-side (real BE) or from mock internal state (mock).
 * No cart param needed here.
 */
export async function placeOrder(form: CheckoutForm): Promise<Order> {
  const body = {
    shipping: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    },
    payment: {
      cardNumber: form.cardNumber,
      cardExpiry: form.cardExpiry,
      cardCvc: form.cardCvc,
    },
  };
  return apiClient.post<Order>("orders", body, sessionHeader());
}

export async function getOrder(id: string): Promise<Order> {
  return apiClient.get<Order>(`orders/${id}`, undefined, sessionHeader());
}
