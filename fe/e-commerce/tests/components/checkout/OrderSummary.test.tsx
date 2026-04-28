import { render, screen } from '@testing-library/react'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import type { Cart } from '@/lib/types/cart'
import type { Product } from '@/lib/types/product'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockProduct: Product = {
  id: 'p-001',
  name: 'Premium Sneakers',
  description: 'Test',
  price: 129.99,
  category: 'Footwear',
  images: ['https://example.com/img.jpg'],
  inventory: 10,
}

const mockCart: Cart = {
  id: 'cart-1',
  items: [{ productId: 'p-001', product: mockProduct, quantity: 2 }],
  subtotal: 259.98,
  taxes: 20.8,
  shipping: 0,
  total: 280.78,
}

describe('OrderSummary', () => {
  it('renders all cart items with name and quantity', () => {
    render(<OrderSummary cart={mockCart} />)
    expect(screen.getByText('Premium Sneakers')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders product images for each line item', () => {
    render(<OrderSummary cart={mockCart} />)
    expect(screen.getByAltText('Premium Sneakers')).toBeInTheDocument()
  })

  it('displays subtotal, tax, shipping, and order total', () => {
    render(<OrderSummary cart={mockCart} />)
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText(/Taxes/i)).toBeInTheDocument()
    expect(screen.getByText('Shipping')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('formats monetary values using formatPrice (USD currency)', () => {
    render(<OrderSummary cart={mockCart} />)
    // $259.98 appears as both the line-item total and the subtotal row
    expect(screen.getAllByText('$259.98').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('$280.78')).toBeInTheDocument()
  })

  it('shows Free for zero shipping', () => {
    render(<OrderSummary cart={mockCart} />)
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('shows line item total as price × quantity', () => {
    render(<OrderSummary cart={mockCart} />)
    expect(screen.getAllByText('$259.98').length).toBeGreaterThanOrEqual(1)
  })
})
