import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '@/components/products/ProductCard'
import type { Product } from '@/lib/types/product'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockMutate = vi.fn()
vi.mock('@/lib/hooks/use-cart', () => ({
  useAddToCart: () => ({ mutate: mockMutate, isPending: false }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const inStockProduct: Product = {
  id: 'p-001',
  name: 'Premium Sneakers',
  description: 'Test',
  price: 129.99,
  category: 'Footwear',
  images: ['https://example.com/img.jpg'],
  inventory: 20,
}

const lowStockProduct: Product = { ...inStockProduct, id: 'p-002', inventory: 3 }
const outOfStockProduct: Product = { ...inStockProduct, id: 'p-003', inventory: 0 }
const newProduct: Product = { ...inStockProduct, id: 'p-004', tags: ['new'] }

describe('ProductCard', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockMutate.mockClear()
  })

  it('renders product name, price, and category', () => {
    render(<ProductCard product={inStockProduct} />)
    expect(screen.getByText('Premium Sneakers')).toBeInTheDocument()
    expect(screen.getByText('$129.99')).toBeInTheDocument()
    expect(screen.getByText('Footwear')).toBeInTheDocument()
  })

  it('renders product image with correct alt text', () => {
    render(<ProductCard product={inStockProduct} />)
    expect(screen.getByAltText('Premium Sneakers')).toBeInTheDocument()
  })

  it('shows low stock badge when inventory is ≤5', () => {
    render(<ProductCard product={lowStockProduct} />)
    expect(screen.getByText(/Only 3 left/i)).toBeInTheDocument()
  })

  it('shows out of stock badge when inventory is 0', () => {
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText(/Out of stock/i)).toBeInTheDocument()
  })

  it('disables the add to cart button when product is out of stock', () => {
    render(<ProductCard product={outOfStockProduct} />)
    const btn = screen.getByRole('button', { name: /Out of stock/i })
    expect(btn).toBeDisabled()
  })

  it('calls addToCart mutate with product when quick-add button is clicked', async () => {
    render(<ProductCard product={inStockProduct} />)
    await userEvent.click(screen.getByRole('button', { name: /Add to cart/i }))
    expect(mockMutate).toHaveBeenCalledWith(
      { productId: 'p-001', quantity: 1 },
      expect.any(Object)
    )
  })

  it('navigates to the product detail page when card is clicked', async () => {
    render(<ProductCard product={inStockProduct} />)
    const card = screen.getByText('Premium Sneakers').closest('div[class*="cursor-pointer"]') as HTMLElement
    await userEvent.click(card)
    expect(mockPush).toHaveBeenCalledWith('/products/p-001')
  })
})
