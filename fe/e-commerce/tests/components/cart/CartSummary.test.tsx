import { render, screen } from '@testing-library/react'
import { CartSummary } from '@/components/cart/CartSummary'
import type { Cart } from '@/lib/types/cart'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const baseCart: Cart = {
  id: 'cart-1',
  items: [],
  subtotal: 50,
  taxes: 4,
  shipping: 9.99,
  total: 63.99,
}

const freeShippingCart: Cart = {
  id: 'cart-2',
  items: [],
  subtotal: 150,
  taxes: 12,
  shipping: 0,
  total: 162,
}

describe('CartSummary', () => {
  it('displays subtotal, tax, shipping, and total', () => {
    render(<CartSummary cart={baseCart} />)
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText(/Taxes/i)).toBeInTheDocument()
    expect(screen.getByText('Shipping')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('formats monetary values using formatPrice (USD currency)', () => {
    render(<CartSummary cart={baseCart} />)
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('$63.99')).toBeInTheDocument()
  })

  it('shows "Free" for shipping when shipping is 0', () => {
    render(<CartSummary cart={freeShippingCart} />)
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('shows add-more-for-free-shipping hint when subtotal < 100', () => {
    render(<CartSummary cart={baseCart} />)
    expect(screen.getByText(/more for free shipping/i)).toBeInTheDocument()
  })

  it('does not show free-shipping hint when subtotal >= 100', () => {
    render(<CartSummary cart={freeShippingCart} />)
    expect(screen.queryByText(/more for free shipping/i)).not.toBeInTheDocument()
  })

  it('renders a checkout CTA link by default', () => {
    render(<CartSummary cart={baseCart} />)
    expect(screen.getByRole('link', { name: /Proceed to checkout/i })).toBeInTheDocument()
  })

  it('hides checkout CTA when showCheckout is false', () => {
    render(<CartSummary cart={baseCart} showCheckout={false} />)
    expect(screen.queryByRole('link', { name: /Proceed to checkout/i })).not.toBeInTheDocument()
  })
})
