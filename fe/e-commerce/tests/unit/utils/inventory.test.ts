import { describe, it, expect } from 'vitest'
import {
  isOutOfStock,
  getInventoryStatus,
  canAddToCart,
  LOW_STOCK_THRESHOLD,
} from '@/lib/utils/inventory'

describe('isOutOfStock', () => {
  it('returns true when inventory is 0', () => {
    expect(isOutOfStock(0)).toBe(true)
  })

  it('returns true when inventory is negative', () => {
    expect(isOutOfStock(-1)).toBe(true)
  })

  it('returns false when inventory is positive', () => {
    expect(isOutOfStock(1)).toBe(false)
    expect(isOutOfStock(100)).toBe(false)
  })
})

describe('getInventoryStatus', () => {
  it('returns out_of_stock when inventory is 0', () => {
    expect(getInventoryStatus(0)).toBe('out_of_stock')
  })

  it('returns out_of_stock when inventory is negative', () => {
    expect(getInventoryStatus(-5)).toBe('out_of_stock')
  })

  it('returns low_stock when inventory is within threshold', () => {
    expect(getInventoryStatus(1)).toBe('low_stock')
    expect(getInventoryStatus(LOW_STOCK_THRESHOLD)).toBe('low_stock')
  })

  it('returns in_stock when inventory is above threshold', () => {
    expect(getInventoryStatus(LOW_STOCK_THRESHOLD + 1)).toBe('in_stock')
    expect(getInventoryStatus(100)).toBe('in_stock')
  })
})

// canAddToCart(inventory, currentQty, requested) — the canonical cart guard.
// Always use this instead of raw inventory checks in components.
describe('canAddToCart', () => {
  it('returns true when currentQty + requested fits within inventory', () => {
    expect(canAddToCart(10, 0, 1)).toBe(true)
    expect(canAddToCart(10, 5, 5)).toBe(true)
    expect(canAddToCart(10, 9, 1)).toBe(true)
  })

  it('returns true when currentQty + requested exactly equals inventory', () => {
    expect(canAddToCart(10, 0, 10)).toBe(true)
    expect(canAddToCart(5, 3, 2)).toBe(true)
  })

  it('returns false when currentQty + requested exceeds inventory', () => {
    expect(canAddToCart(10, 8, 3)).toBe(false)
    expect(canAddToCart(5, 5, 1)).toBe(false)
  })

  it('returns false when inventory is 0', () => {
    expect(canAddToCart(0, 0, 1)).toBe(false)
  })
})
