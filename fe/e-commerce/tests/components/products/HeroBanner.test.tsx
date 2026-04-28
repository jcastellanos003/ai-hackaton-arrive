import { render, screen } from '@testing-library/react'
import { HeroBanner } from '@/components/products/HeroBanner'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('HeroBanner', () => {
  it('renders a promotional heading', () => {
    render(<HeroBanner />)
    expect(screen.getByText(/50% OFF/i)).toBeInTheDocument()
  })

  it('renders a CTA button or link', () => {
    render(<HeroBanner />)
    expect(screen.getByRole('link', { name: /Get Discount/i })).toBeInTheDocument()
  })

  it('Get Discount links to Footwear category', () => {
    render(<HeroBanner />)
    expect(screen.getByRole('link', { name: /Get Discount/i })).toHaveAttribute(
      'href',
      '/?category=Footwear'
    )
  })

  it('renders the secondary New Collection banner with Shop Now link', () => {
    render(<HeroBanner />)
    expect(screen.getByText(/New Collection/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Shop Now/i })).toHaveAttribute(
      'href',
      '/?category=Clothing'
    )
  })
})
