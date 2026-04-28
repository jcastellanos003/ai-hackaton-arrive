import { vi } from 'vitest'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '@/lib/api/cart-service'

vi.mock('@/lib/api/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/lib/utils/session', () => ({
  getSessionId: () => 'test-session-id',
}))

import { apiClient } from '@/lib/api/api-client'

const mockedGet = vi.mocked(apiClient.get)
const mockedPost = vi.mocked(apiClient.post)
const mockedPatch = vi.mocked(apiClient.patch)
const mockedDelete = vi.mocked(apiClient.delete)

const emptyCart = { id: 'cart-1', items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 }

describe('cart-service', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    mockedPost.mockReset()
    mockedPatch.mockReset()
    mockedDelete.mockReset()
  })

  describe('getCart', () => {
    it('calls GET cart and returns the current cart', async () => {
      mockedGet.mockResolvedValue(emptyCart)
      const result = await getCart()
      expect(mockedGet).toHaveBeenCalledWith('cart', undefined, { 'X-Session-ID': 'test-session-id' })
      expect(result).toEqual(emptyCart)
    })

    it('returns an empty cart when no items exist', async () => {
      mockedGet.mockResolvedValue(emptyCart)
      const result = await getCart()
      expect(result.items).toHaveLength(0)
    })
  })

  describe('addToCart', () => {
    it('posts to cart/items and returns the updated cart', async () => {
      const updatedCart = { ...emptyCart, items: [{ productId: 'p-001', quantity: 1 }] }
      mockedPost.mockResolvedValue(updatedCart)
      const result = await addToCart('p-001', 1)
      expect(mockedPost).toHaveBeenCalledWith(
        'cart/items',
        { productId: 'p-001', quantity: 1 },
        { 'X-Session-ID': 'test-session-id' }
      )
      expect(result).toEqual(updatedCart)
    })

    it('sends X-Session-ID header on every request', async () => {
      mockedPost.mockResolvedValue(emptyCart)
      await addToCart('p-001', 1)
      expect(mockedPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { 'X-Session-ID': 'test-session-id' }
      )
    })

    it('throws INSUFFICIENT_INVENTORY when quantity exceeds stock', async () => {
      mockedPost.mockRejectedValue({ error: 'Only 3 items left in stock', code: 'INSUFFICIENT_INVENTORY' })
      await expect(addToCart('p-001', 99)).rejects.toMatchObject({ code: 'INSUFFICIENT_INVENTORY' })
    })
  })

  describe('updateCartItem', () => {
    it('patches cart/items/:productId and returns updated cart', async () => {
      const updatedCart = { ...emptyCart, items: [{ productId: 'p-001', quantity: 3 }] }
      mockedPatch.mockResolvedValue(updatedCart)
      const result = await updateCartItem('p-001', 3)
      expect(mockedPatch).toHaveBeenCalledWith(
        'cart/items/p-001',
        { quantity: 3 },
        { 'X-Session-ID': 'test-session-id' }
      )
      expect(result).toEqual(updatedCart)
    })

    it('throws CART_ITEM_NOT_FOUND when item is not in cart', async () => {
      mockedPatch.mockRejectedValue({ error: 'Item not in cart', code: 'CART_ITEM_NOT_FOUND' })
      await expect(updateCartItem('p-999', 1)).rejects.toMatchObject({ code: 'CART_ITEM_NOT_FOUND' })
    })
  })

  describe('removeFromCart', () => {
    it('deletes cart/items/:productId and returns the updated cart', async () => {
      mockedDelete.mockResolvedValue(emptyCart)
      const result = await removeFromCart('p-001')
      expect(mockedDelete).toHaveBeenCalledWith('cart/items/p-001', { 'X-Session-ID': 'test-session-id' })
      expect(result).toEqual(emptyCart)
    })
  })

  describe('clearCart', () => {
    it('deletes cart and returns { message: "Cart cleared" }', async () => {
      mockedDelete.mockResolvedValue({ message: 'Cart cleared' })
      const result = await clearCart()
      expect(mockedDelete).toHaveBeenCalledWith('cart', { 'X-Session-ID': 'test-session-id' })
      expect(result).toEqual({ message: 'Cart cleared' })
    })
  })
})
