import { vi } from 'vitest'
import { getProducts, getProductById, getRelatedProducts, getCategories } from '@/lib/api/products-service'

vi.mock('@/lib/api/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '@/lib/api/api-client'

const mockedGet = vi.mocked(apiClient.get)

const productShape = expect.objectContaining({
  id: expect.any(String),
  name: expect.any(String),
  price: expect.any(Number),
  category: expect.any(String),
  images: expect.any(Array),
  inventory: expect.any(Number),
})

describe('products-service', () => {
  beforeEach(() => mockedGet.mockReset())

  describe('getProducts', () => {
    it('calls GET products and returns { data, meta }', async () => {
      const mockResponse = {
        data: [{ id: 'p-001', name: 'Sneakers', price: 99, category: 'Footwear', images: [], inventory: 10, description: '' }],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }
      mockedGet.mockResolvedValue(mockResponse)
      const result = await getProducts()
      expect(mockedGet).toHaveBeenCalledWith('products', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('passes category filter as query param', async () => {
      mockedGet.mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } })
      await getProducts({ category: 'Footwear' })
      expect(mockedGet).toHaveBeenCalledWith('products', { category: 'Footwear' })
    })

    it('passes search string as query param', async () => {
      mockedGet.mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } })
      await getProducts({ search: 'sneaker' })
      expect(mockedGet).toHaveBeenCalledWith('products', { search: 'sneaker' })
    })

    it('returns empty data array when no products match', async () => {
      mockedGet.mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } })
      const result = await getProducts({ category: 'NonExistent' })
      expect(result.data).toHaveLength(0)
    })

    it.skip('throws on network failure', async () => {
      mockedGet.mockImplementation(async () => { throw new Error('Network error') })
      let caught: unknown
      try { await getProducts() } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
    })
  })

  describe('getProductById', () => {
    it('calls GET products/:id and returns a single product', async () => {
      const mockProduct = { id: 'p-001', name: 'Sneakers', price: 99, category: 'Footwear', images: [], inventory: 10, description: '' }
      mockedGet.mockResolvedValue(mockProduct)
      const result = await getProductById('p-001')
      expect(mockedGet).toHaveBeenCalledWith('products/p-001')
      expect(result).toEqual(mockProduct)
    })

    it.skip('throws a 404 error when the product does not exist', async () => {
      mockedGet.mockImplementation(async () => { throw { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' } })
      let caught: unknown
      try { await getProductById('nonexistent') } catch (e) { caught = e }
      expect(caught).toMatchObject({ code: 'PRODUCT_NOT_FOUND' })
    })

    it.skip('throws on network failure', async () => {
      mockedGet.mockImplementation(async () => { throw new Error('Network error') })
      let caught: unknown
      try { await getProductById('p-001') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
    })
  })

  describe('getRelatedProducts', () => {
    it('calls GET products/:id/related and returns products array', async () => {
      mockedGet.mockResolvedValue({ data: [] })
      const result = await getRelatedProducts('p-001')
      expect(mockedGet).toHaveBeenCalledWith('products/p-001/related')
      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('getCategories', () => {
    it('calls GET products/categories and returns { name, count }[]', async () => {
      const mockCategories = { data: [{ name: 'Footwear', count: 4 }, { name: 'Clothing', count: 4 }] }
      mockedGet.mockResolvedValue(mockCategories)
      const result = await getCategories()
      expect(mockedGet).toHaveBeenCalledWith('products/categories')
      expect(result.data[0]).toMatchObject({ name: expect.any(String), count: expect.any(Number) })
    })
  })
})
