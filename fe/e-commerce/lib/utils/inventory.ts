export const LOW_STOCK_THRESHOLD = 5;

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export function getInventoryStatus(inventory: number): InventoryStatus {
  if (inventory <= 0) return "out_of_stock";
  if (inventory <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export function isOutOfStock(inventory: number): boolean {
  return inventory <= 0;
}

export function canAddToCart(
  inventory: number,
  currentQty: number,
  requested: number
): boolean {
  return currentQty + requested <= inventory;
}
