import { apiClient } from "./api-client";
import { getSessionId } from "@/lib/utils/session";
import type { Cart } from "@/lib/types/cart";

function sessionHeader(): Record<string, string> {
  return { "X-Session-ID": getSessionId() };
}

export async function getCart(): Promise<Cart> {
  return apiClient.get<Cart>("cart", undefined, sessionHeader());
}

export async function addToCart(
  productId: string,
  quantity: number
): Promise<Cart> {
  return apiClient.post<Cart>(
    "cart/items",
    { productId, quantity },
    sessionHeader()
  );
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<Cart> {
  return apiClient.patch<Cart>(
    `cart/items/${productId}`,
    { quantity },
    sessionHeader()
  );
}

export async function removeFromCart(productId: string): Promise<Cart> {
  return apiClient.delete<Cart>(`cart/items/${productId}`, sessionHeader());
}

export async function clearCart(): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>("cart", sessionHeader());
}
