import { describe, it, expect } from 'vitest'
import { formatPrice } from '@/lib/utils/currency'

describe('formatPrice', () => {
  it('formats whole dollar amounts', () => {
    expect(formatPrice(100)).toBe('$100.00')
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('formats decimal amounts to 2 decimal places', () => {
    expect(formatPrice(29.99)).toBe('$29.99')
    expect(formatPrice(9.9)).toBe('$9.90')
  })

  it('formats large numbers with comma separators', () => {
    expect(formatPrice(1000000)).toBe('$1,000,000.00')
    expect(formatPrice(1234.56)).toBe('$1,234.56')
  })

  it('formats negative values', () => {
    expect(formatPrice(-10)).toBe('-$10.00')
  })
})
