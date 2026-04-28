"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/lib/api/cart-service";
import { queryKeys } from "@/lib/constants/query-keys";
import type { Cart } from "@/lib/types/cart";

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: getCart,
    staleTime: 0,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addToCart(productId, quantity),
    onSuccess: (updatedCart) => {
      qc.setQueryData(queryKeys.cart.all, updatedCart);
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart.all });
      const prev = qc.getQueryData<Cart>(queryKeys.cart.all);
      if (prev) {
        const updated: Cart = {
          ...prev,
          items: prev.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        };
        qc.setQueryData(queryKeys.cart.all, updated);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.cart.all, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeFromCart(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart.all });
      const prev = qc.getQueryData<Cart>(queryKeys.cart.all);
      if (prev) {
        const updated: Cart = {
          ...prev,
          items: prev.items.filter((item) => item.productId !== productId),
        };
        qc.setQueryData(queryKeys.cart.all, updated);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.cart.all, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}
