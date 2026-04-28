import type { Cart } from "@/lib/types/cart";
import type { CheckoutForm } from "@/lib/types/order";
import type { Order } from "@/lib/types/order";
import { mockClearCart } from "./mock-cart";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let orderSeq = 1;

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

export async function mockPlaceOrder(
  form: CheckoutForm,
  cart: Cart
): Promise<Order> {
  await delay(600 + Math.random() * 600);

  const year = new Date().getFullYear();
  const orderNumber = `BM-${year}-${String(orderSeq++).padStart(5, "0")}`;

  const deliveryDays = 3 + Math.floor(Math.random() * 3); // 3–5 business days
  const estimatedDelivery = addBusinessDays(new Date(), deliveryDays)
    .toISOString()
    .slice(0, 10);

  const order: Order = {
    id: `order-${Date.now()}`,
    orderNumber,
    status: "processing",
    items: cart.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0],
      price: item.product.price,
      quantity: item.quantity,
    })),
    subtotal: cart.subtotal,
    taxes: cart.taxes,
    shipping: cart.shipping,
    total: cart.total,
    customerName: `${form.firstName} ${form.lastName}`,
    email: form.email,
    estimatedDelivery,
    createdAt: new Date().toISOString(),
  };

  // Store for later retrieval
  mockOrders.set(order.id, order);

  await mockClearCart();

  return order;
}

const mockOrders: Map<string, Order> = new Map();

export async function mockGetOrder(id: string): Promise<Order> {
  await delay(400 + Math.random() * 400);
  const order = mockOrders.get(id);
  if (!order) throw { error: "Order not found", code: "ORDER_NOT_FOUND" };
  return order;
}
