import { queryKeys } from '@/lib/constants/query-keys'

describe('queryKeys', () => {
  describe('products', () => {
    it('returns a stable base key for all products queries', () => {
      expect(queryKeys.products.all).toEqual(['products'])
    })

    it('returns a unique key per product ID for detail queries', () => {
      expect(queryKeys.products.detail('p-001')).toEqual(['products', 'detail', 'p-001'])
      expect(queryKeys.products.detail('p-002')).not.toEqual(queryKeys.products.detail('p-001'))
    })

    it('returns a unique key per category + id for related queries', () => {
      const k1 = queryKeys.products.related('p-001', 'Footwear')
      const k2 = queryKeys.products.related('p-001', 'Clothing')
      expect(k1).not.toEqual(k2)
    })

    it('includes filters in list key so different filters are distinct', () => {
      const k1 = queryKeys.products.list({ category: 'Footwear' })
      const k2 = queryKeys.products.list({ category: 'Clothing' })
      expect(k1).not.toEqual(k2)
    })

    it('returns categories key', () => {
      expect(queryKeys.products.categories).toEqual(['products', 'categories'])
    })
  })

  describe('cart', () => {
    it('returns a stable key for the cart query', () => {
      expect(queryKeys.cart.all).toEqual(['cart'])
    })
  })

  describe('orders', () => {
    it('returns a unique key per order ID', () => {
      expect(queryKeys.orders.detail('order-1')).toEqual(['orders', 'detail', 'order-1'])
      expect(queryKeys.orders.detail('order-2')).not.toEqual(queryKeys.orders.detail('order-1'))
    })
  })

  it('all keys are arrays (required by TanStack Query)', () => {
    expect(Array.isArray(queryKeys.products.all)).toBe(true)
    expect(Array.isArray(queryKeys.products.categories)).toBe(true)
    expect(Array.isArray(queryKeys.products.list())).toBe(true)
    expect(Array.isArray(queryKeys.products.detail('x'))).toBe(true)
    expect(Array.isArray(queryKeys.products.related('x', 'y'))).toBe(true)
    expect(Array.isArray(queryKeys.cart.all)).toBe(true)
    expect(Array.isArray(queryKeys.orders.detail('x'))).toBe(true)
  })
})
