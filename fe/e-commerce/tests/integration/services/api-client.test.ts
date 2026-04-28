import { vi } from 'vitest'

vi.mock('@/lib/api/mock/mock-products', () => ({
  mockGetProducts: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
  mockGetProductById: vi.fn().mockResolvedValue({ id: 'p-001', name: 'Sneakers' }),
  mockGetRelatedProducts: vi.fn().mockResolvedValue({ data: [] }),
  mockGetCategories: vi.fn().mockResolvedValue({ data: [] }),
}))

vi.mock('@/lib/api/mock/mock-cart', () => ({
  mockGetCart: vi.fn().mockResolvedValue({ id: 'mock-cart', items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 }),
  mockAddToCart: vi.fn().mockResolvedValue({ id: 'mock-cart', items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 }),
  mockUpdateCartItem: vi.fn().mockResolvedValue({ id: 'mock-cart', items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 }),
  mockRemoveFromCart: vi.fn().mockResolvedValue({ id: 'mock-cart', items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 }),
  mockClearCart: vi.fn().mockResolvedValue({ message: 'Cart cleared' }),
}))

vi.mock('@/lib/api/mock/mock-orders', () => ({
  mockPlaceOrder: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'BM-2026-00001' }),
  mockGetOrder: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'BM-2026-00001' }),
}))

import { apiClient } from '@/lib/api/api-client'
import { mockGetProducts } from '@/lib/api/mock/mock-products'
import { mockGetCart, mockAddToCart, mockRemoveFromCart, mockClearCart } from '@/lib/api/mock/mock-cart'
import { mockGetOrder } from '@/lib/api/mock/mock-orders'

describe('api-client', () => {
  describe('when NEXT_PUBLIC_API_URL is not set (mock mode)', () => {
    it('routes GET /products to mockGetProducts', async () => {
      await apiClient.get('products')
      expect(vi.mocked(mockGetProducts)).toHaveBeenCalled()
    })

    it('routes GET /cart to mockGetCart', async () => {
      await apiClient.get('cart')
      expect(vi.mocked(mockGetCart)).toHaveBeenCalled()
    })

    it('routes POST /cart/items to mockAddToCart', async () => {
      await apiClient.post('cart/items', { productId: 'p-001', quantity: 1 })
      expect(vi.mocked(mockAddToCart)).toHaveBeenCalledWith('p-001', 1)
    })

    it('routes DELETE /cart/items/:id to mockRemoveFromCart', async () => {
      await apiClient.delete('cart/items/p-001')
      expect(vi.mocked(mockRemoveFromCart)).toHaveBeenCalledWith('p-001')
    })

    it('routes DELETE /cart to mockClearCart', async () => {
      await apiClient.delete('cart')
      expect(vi.mocked(mockClearCart)).toHaveBeenCalled()
    })

    it('routes GET /orders/:id to mockGetOrder', async () => {
      await apiClient.get('orders/order-1')
      expect(vi.mocked(mockGetOrder)).toHaveBeenCalledWith('order-1')
    })

    it('throws on unhandled mock paths', async () => {
      await expect(apiClient.get('unknown/path/xyz')).rejects.toThrow(/Unhandled/)
    })
  })
})
