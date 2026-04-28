import { vi } from 'vitest'
import { placeOrder, getOrder } from '@/lib/api/orders-service'

vi.mock('@/lib/api/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('@/lib/utils/session', () => ({
  getSessionId: () => 'test-session-id',
}))

import { apiClient } from '@/lib/api/api-client'

const mockedPost = vi.mocked(apiClient.post)
const mockedGet = vi.mocked(apiClient.get)

const validForm = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '+1 555 000 1234',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'US',
  cardNumber: '4111111111111111',
  cardExpiry: '12/26',
  cardCvc: '123',
}

const mockOrder = {
  id: 'order-1',
  orderNumber: 'BM-2026-00001',
  status: 'processing',
  items: [],
  subtotal: 99,
  taxes: 7.92,
  shipping: 0,
  total: 106.92,
  customerName: 'Jane Doe',
  email: 'jane@example.com',
  estimatedDelivery: '2026-05-05',
  createdAt: new Date().toISOString(),
}

describe('orders-service', () => {
  beforeEach(() => {
    mockedPost.mockReset()
    mockedGet.mockReset()
  })

  describe('placeOrder', () => {
    it('posts to orders with shipping + payment body', async () => {
      mockedPost.mockResolvedValue(mockOrder)
      await placeOrder(validForm)
      expect(mockedPost).toHaveBeenCalledWith(
        'orders',
        {
          shipping: {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '+1 555 000 1234',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
          },
          payment: {
            cardNumber: '4111111111111111',
            cardExpiry: '12/26',
            cardCvc: '123',
          },
        },
        { 'X-Session-ID': 'test-session-id' }
      )
    })

    it('returns the order on success', async () => {
      mockedPost.mockResolvedValue(mockOrder)
      const result = await placeOrder(validForm)
      expect(result).toEqual(mockOrder)
      expect(result.orderNumber).toMatch(/^BM-\d{4}-\d{5}$/)
    })

    it('sends X-Session-ID header', async () => {
      mockedPost.mockResolvedValue(mockOrder)
      await placeOrder(validForm)
      const [, , headers] = mockedPost.mock.calls[0]
      expect(headers).toEqual({ 'X-Session-ID': 'test-session-id' })
    })

    it('throws on server error', async () => {
      mockedPost.mockRejectedValue({ error: 'Payment failed', code: 'PAYMENT_ERROR' })
      await expect(placeOrder(validForm)).rejects.toMatchObject({ code: 'PAYMENT_ERROR' })
    })
  })

  describe('getOrder', () => {
    it('calls GET orders/:id and returns the order', async () => {
      mockedGet.mockResolvedValue(mockOrder)
      const result = await getOrder('order-1')
      expect(mockedGet).toHaveBeenCalledWith('orders/order-1', undefined, { 'X-Session-ID': 'test-session-id' })
      expect(result).toEqual(mockOrder)
    })

    it('throws ORDER_NOT_FOUND when order does not exist', async () => {
      mockedGet.mockRejectedValue({ error: 'Order not found', code: 'ORDER_NOT_FOUND' })
      await expect(getOrder('bad-id')).rejects.toMatchObject({ code: 'ORDER_NOT_FOUND' })
    })
  })
})
