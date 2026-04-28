import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart } from '@/lib/hooks/use-cart'

vi.mock('@/lib/api/cart-service', () => ({
  getCart: vi.fn(),
  addToCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeFromCart: vi.fn(),
}))

import { getCart, addToCart, updateCartItem, removeFromCart } from '@/lib/api/cart-service'

const mockedGetCart = vi.mocked(getCart)
const mockedAddToCart = vi.mocked(addToCart)
const mockedUpdateCartItem = vi.mocked(updateCartItem)
const mockedRemoveFromCart = vi.mocked(removeFromCart)

const emptyCart = { id: 'cart-1', items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 }

const mockProduct = {
  id: 'p-001',
  name: 'Sneakers',
  description: '',
  price: 99,
  category: 'Footwear',
  images: [],
  inventory: 10,
}

const cartWithItem = {
  ...emptyCart,
  items: [{ productId: 'p-001', product: mockProduct, quantity: 2 }],
  subtotal: 198,
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useCart', () => {
  beforeEach(() => mockedGetCart.mockReset())

  it('returns loading state while fetching', async () => {
    let resolveQuery!: (v: typeof emptyCart) => void
    const queryPromise = new Promise<typeof emptyCart>(r => { resolveQuery = r })
    mockedGetCart.mockReturnValue(queryPromise)
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isFetching).toBe(true))
    expect(result.current.isLoading).toBe(true)
    resolveQuery(emptyCart)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns empty cart on initial load', async () => {
    mockedGetCart.mockResolvedValue(emptyCart)
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(0)
  })

  it('returns cart items when cart has products', async () => {
    mockedGetCart.mockResolvedValue(cartWithItem)
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(1)
  })
})

describe('useAddToCart', () => {
  beforeEach(() => {
    mockedGetCart.mockResolvedValue(emptyCart)
    mockedAddToCart.mockReset()
  })

  it('adds a product to the cart via mutation', async () => {
    mockedAddToCart.mockResolvedValue(cartWithItem)
    const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ productId: 'p-001', quantity: 2 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedAddToCart).toHaveBeenCalledWith('p-001', 2)
  })

  it('reflects error state when add fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedAddToCart.mockRejectedValue({ error: 'Out of stock', code: 'INSUFFICIENT_INVENTORY' })
    const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() })
    act(() => { result.current.mutate({ productId: 'p-001', quantity: 999 }) })
    await waitFor(() => expect(result.current.isError).toBe(true))
    vi.restoreAllMocks()
  })
})

describe('useUpdateCartItem', () => {
  beforeEach(() => {
    mockedGetCart.mockResolvedValue(cartWithItem)
    mockedUpdateCartItem.mockReset()
  })

  it('updates item quantity via mutation', async () => {
    const updated = { ...cartWithItem, items: [{ ...cartWithItem.items[0], quantity: 5 }] }
    mockedUpdateCartItem.mockResolvedValue(updated)
    const { result } = renderHook(() => useUpdateCartItem(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ productId: 'p-001', quantity: 5 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedUpdateCartItem).toHaveBeenCalledWith('p-001', 5)
  })
})

describe('useRemoveFromCart', () => {
  beforeEach(() => {
    mockedGetCart.mockResolvedValue(cartWithItem)
    mockedRemoveFromCart.mockReset()
  })

  it('removes item from cart via mutation', async () => {
    mockedRemoveFromCart.mockResolvedValue(emptyCart)
    const { result } = renderHook(() => useRemoveFromCart(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('p-001')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedRemoveFromCart).toHaveBeenCalledWith('p-001')
  })
})
