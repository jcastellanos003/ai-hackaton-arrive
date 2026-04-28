import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { useProduct, useRelatedProducts } from '@/lib/hooks/use-product'

vi.mock('@/lib/api/products-service', () => ({
  getProductById: vi.fn(),
  getRelatedProducts: vi.fn(),
}))

import { getProductById, getRelatedProducts } from '@/lib/api/products-service'

const mockedGetProductById = vi.mocked(getProductById)
const mockedGetRelatedProducts = vi.mocked(getRelatedProducts)

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

const mockProduct = {
  id: 'p-001',
  name: 'Sneakers',
  description: 'Test',
  price: 99,
  category: 'Footwear',
  images: ['https://example.com/img.jpg'],
  inventory: 10,
}

describe('useProduct', () => {
  beforeEach(() => mockedGetProductById.mockReset())

  it('returns loading state while fetching', async () => {
    let resolveQuery!: (v: typeof mockProduct) => void
    const queryPromise = new Promise<typeof mockProduct>(r => { resolveQuery = r })
    mockedGetProductById.mockReturnValue(queryPromise)
    const { result } = renderHook(() => useProduct('p-001'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isFetching).toBe(true))
    expect(result.current.isLoading).toBe(true)
    resolveQuery(mockProduct)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns product data on successful fetch', async () => {
    mockedGetProductById.mockResolvedValue(mockProduct)
    const { result } = renderHook(() => useProduct('p-001'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('Sneakers')
  })

  it.skip('returns error state when product is not found', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedGetProductById.mockImplementation(async () => { throw { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' } })
    const { result } = renderHook(() => useProduct('bad-id'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    vi.restoreAllMocks()
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useProduct(''), { wrapper: wrapper() })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedGetProductById).not.toHaveBeenCalled()
  })
})

describe('useRelatedProducts', () => {
  beforeEach(() => mockedGetRelatedProducts.mockReset())

  it('returns related products on success', async () => {
    mockedGetRelatedProducts.mockResolvedValue({ data: [mockProduct] })
    const { result } = renderHook(
      () => useRelatedProducts('p-002', 'Footwear'),
      { wrapper: wrapper() }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
  })

  it('does not fetch when productId or category is empty', () => {
    const { result } = renderHook(
      () => useRelatedProducts('', ''),
      { wrapper: wrapper() }
    )
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedGetRelatedProducts).not.toHaveBeenCalled()
  })
})
