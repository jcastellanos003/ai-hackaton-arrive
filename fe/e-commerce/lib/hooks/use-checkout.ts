"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { placeOrder, getOrder } from "@/lib/api/orders-service";
import { queryKeys } from "@/lib/constants/query-keys";
import type { CheckoutForm } from "@/lib/types/order";

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CheckoutForm) => placeOrder(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}
