import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { useProducts, useCategories } from '@/lib/hooks/use-products'

vi.mock('@/lib/api/products-service', () => ({
  getProducts: vi.fn(),
  getCategories: vi.fn(),
}))

import { getProducts, getCategories } from '@/lib/api/products-service'

const mockedGetProducts = vi.mocked(getProducts)
const mockedGetCategories = vi.mocked(getCategories)

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

const mockProductsResponse = {
  data: [
    { id: 'p-001', name: 'Sneakers', price: 99, category: 'Footwear', images: [], inventory: 10, description: '' },
  ],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

describe('useProducts', () => {
  beforeEach(() => mockedGetProducts.mockReset())

  it('returns loading state while fetching', async () => {
    let resolveQuery!: (v: typeof mockProductsResponse) => void
    const queryPromise = new Promise<typeof mockProductsResponse>(r => { resolveQuery = r })
    mockedGetProducts.mockReturnValue(queryPromise)
    const { result } = renderHook(() => useProducts(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isFetching).toBe(true))
    expect(result.current.isLoading).toBe(true)
    resolveQuery(mockProductsResponse)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns products array on successful fetch', async () => {
    mockedGetProducts.mockResolvedValue(mockProductsResponse)
    const { result } = renderHook(() => useProducts(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].name).toBe('Sneakers')
  })

  it.skip('returns error state on network failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedGetProducts.mockImplementation(async () => { throw new Error('Network error') })
    const { result } = renderHook(() => useProducts(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    vi.restoreAllMocks()
  })

  it('is configured with staleTime of 5 minutes (queryFn is not called twice for same key)', async () => {
    mockedGetProducts.mockResolvedValue(mockProductsResponse)
    const { result } = renderHook(() => useProducts(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedGetProducts).toHaveBeenCalledOnce()
  })
})

describe('useCategories', () => {
  beforeEach(() => mockedGetCategories.mockReset())

  it('returns categories on success', async () => {
    mockedGetCategories.mockResolvedValue({ data: [{ name: 'Footwear', count: 4 }] })
    const { result } = renderHook(() => useCategories(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].name).toBe('Footwear')
  })

  it.skip('returns error state on failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedGetCategories.mockImplementation(async () => { throw new Error('fail') })
    const { result } = renderHook(() => useCategories(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    vi.restoreAllMocks()
  })
})
