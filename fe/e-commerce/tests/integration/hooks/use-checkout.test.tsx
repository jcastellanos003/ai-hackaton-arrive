import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { useCheckout, useOrder } from '@/lib/hooks/use-checkout'

vi.mock('@/lib/api/orders-service', () => ({
  placeOrder: vi.fn(),
  getOrder: vi.fn(),
}))

import { placeOrder, getOrder } from '@/lib/api/orders-service'

const mockedPlaceOrder = vi.mocked(placeOrder)
const mockedGetOrder = vi.mocked(getOrder)

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

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useCheckout', () => {
  beforeEach(() => mockedPlaceOrder.mockReset())

  it('places an order via mutation on success', async () => {
    mockedPlaceOrder.mockResolvedValue(mockOrder)
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(validForm)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedPlaceOrder).toHaveBeenCalledWith(validForm)
  })

  it('returns order confirmation with id on success', async () => {
    mockedPlaceOrder.mockResolvedValue(mockOrder)
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(validForm)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('order-1')
    expect(result.current.data?.orderNumber).toBe('BM-2026-00001')
  })

  it.skip('returns error state when order placement fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedPlaceOrder.mockImplementation(async () => { throw { error: 'Payment failed', code: 'PAYMENT_ERROR' } })
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })
    await act(async () => { result.current.mutate(validForm) })
    await waitFor(() => expect(result.current.isError).toBe(true))
    vi.restoreAllMocks()
  })
})

describe('useOrder', () => {
  beforeEach(() => mockedGetOrder.mockReset())

  it('fetches order by id on success', async () => {
    mockedGetOrder.mockResolvedValue(mockOrder)
    const { result } = renderHook(() => useOrder('order-1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.orderNumber).toBe('BM-2026-00001')
    expect(mockedGetOrder).toHaveBeenCalledWith('order-1')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useOrder(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedGetOrder).not.toHaveBeenCalled()
  })

  it.skip('returns error state when order not found', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedGetOrder.mockImplementation(async () => { throw { error: 'Order not found', code: 'ORDER_NOT_FOUND' } })
    const { result } = renderHook(() => useOrder('bad-id'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    vi.restoreAllMocks()
  })
})
