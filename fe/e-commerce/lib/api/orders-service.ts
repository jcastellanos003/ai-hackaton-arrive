import { apiClient } from "./api-client";
import { getSessionId } from "@/lib/utils/session";
import type { Order, CheckoutForm } from "@/lib/types/order";
import type { Cart } from "@/lib/types/cart";

function sessionHeader(): Record<string, string> {
  return { "X-Session-ID": getSessionId() };
}

export async function placeOrder(
  form: CheckoutForm,
  cart: Cart
): Promise<Order> {
  return apiClient.post<Order>("orders", { form, cart }, sessionHeader());
}

export async function getOrder(id: string): Promise<Order> {
  return apiClient.get<Order>(`orders/${id}`, undefined, sessionHeader());
}
