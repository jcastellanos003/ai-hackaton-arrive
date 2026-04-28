import type { Cart } from "@/lib/types/cart";
import type { Order } from "@/lib/types/order";

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

export type OrderBody = {
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  payment: {
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
  };
};

/**
 * Mirrors real BE behaviour: accepts { shipping, payment } body and reads the
 * cart from the mock's internal state (passed in by the mock dispatcher, just
 * as the real BE reads it via X-Session-ID).
 */
export async function mockPlaceOrder(
  body: OrderBody,
  cart: Cart
): Promise<Order> {
  await delay(600 + Math.random() * 600);

  const { mockClearCart } = await import("./mock-cart");

  const year = new Date().getFullYear();
  const orderNumber = `BM-${year}-${String(orderSeq++).padStart(5, "0")}`;

  const deliveryDays = 3 + Math.floor(Math.random() * 3);
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
    customerName: `${body.shipping.firstName} ${body.shipping.lastName}`,
    email: body.shipping.email,
    estimatedDelivery,
    createdAt: new Date().toISOString(),
  };

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
