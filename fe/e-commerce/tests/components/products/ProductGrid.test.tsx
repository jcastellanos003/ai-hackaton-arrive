import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGrid } from '@/components/products/ProductGrid'
import type { Product } from '@/lib/types/product'

vi.mock('@/components/products/ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
  ProductCardSkeleton: () => <div data-testid="product-card-skeleton" />,
}))

const mockProducts: Product[] = [
  {
    id: 'p-001',
    name: 'Sneakers',
    description: 'Test',
    price: 99,
    category: 'Footwear',
    images: ['https://example.com/img.jpg'],
    inventory: 10,
  },
  {
    id: 'p-002',
    name: 'Watch',
    description: 'Test',
    price: 249,
    category: 'Accessories',
    images: ['https://example.com/img2.jpg'],
    inventory: 5,
  },
]

describe('ProductGrid', () => {
  it('renders the correct number of cards for the given products list', () => {
    render(<ProductGrid products={mockProducts} isLoading={false} isError={false} onRetry={vi.fn()} />)
    expect(screen.getAllByTestId('product-card')).toHaveLength(2)
    expect(screen.getByText('Sneakers')).toBeInTheDocument()
    expect(screen.getByText('Watch')).toBeInTheDocument()
  })

  it('shows 8 skeleton loaders while loading', () => {
    render(<ProductGrid products={[]} isLoading={true} isError={false} onRetry={vi.fn()} />)
    expect(screen.getAllByTestId('product-card-skeleton')).toHaveLength(8)
  })

  it('shows an error message with retry button on fetch failure', () => {
    render(<ProductGrid products={[]} isLoading={false} isError={true} onRetry={vi.fn()} />)
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn()
    render(<ProductGrid products={[]} isLoading={false} isError={true} onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /Try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows an empty state when no products match the current filter', () => {
    render(<ProductGrid products={[]} isLoading={false} isError={false} onRetry={vi.fn()} />)
    expect(screen.getByText(/No products found/i)).toBeInTheDocument()
  })
})
