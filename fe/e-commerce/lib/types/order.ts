import { z } from "zod";

export const checkoutFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(19, "Card number too long"),
  cardExpiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Expiry must be MM/YY"),
  cardCvc: z
    .string()
    .min(3, "CVC must be 3–4 digits")
    .max(4, "CVC must be 3–4 digits"),
});

export type CheckoutForm = z.infer<typeof checkoutFormSchema>;

export type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
  customerName: string;
  email: string;
  estimatedDelivery: string;
  createdAt: string;
};
