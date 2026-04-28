import { render, screen } from '@testing-library/react'
import { EmptyCart } from '@/components/cart/EmptyCart'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('EmptyCart', () => {
  it('renders an empty state icon', () => {
    render(<EmptyCart />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders a descriptive message', () => {
    render(<EmptyCart />)
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument()
    expect(screen.getByText(/Add some products/i)).toBeInTheDocument()
  })

  it('renders a Continue Shopping CTA that links to the home page', () => {
    render(<EmptyCart />)
    const link = screen.getByRole('link', { name: /Start shopping/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
