import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartItem } from '@/components/cart/CartItem'
import type { CartItem as CartItemType } from '@/lib/types/cart'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockUpdateMutate = vi.fn()
const mockRemoveMutate = vi.fn()

vi.mock('@/lib/hooks/use-cart', () => ({
  useUpdateCartItem: () => ({ mutate: mockUpdateMutate, isPending: false }),
  useRemoveFromCart: () => ({ mutate: mockRemoveMutate, isPending: false }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const item: CartItemType = {
  productId: 'p-001',
  quantity: 2,
  product: {
    id: 'p-001',
    name: 'Premium Sneakers',
    description: 'Test',
    price: 129.99,
    category: 'Footwear',
    images: ['https://example.com/img.jpg'],
    inventory: 10,
  },
}

describe('CartItem', () => {
  beforeEach(() => {
    mockUpdateMutate.mockClear()
    mockRemoveMutate.mockClear()
  })

  it('renders product name, category, and quantity', () => {
    render(<CartItem item={item} />)
    expect(screen.getByText('Premium Sneakers')).toBeInTheDocument()
    expect(screen.getByText('Footwear')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders product image', () => {
    render(<CartItem item={item} />)
    expect(screen.getByAltText('Premium Sneakers')).toBeInTheDocument()
  })

  it('displays correct item subtotal (price × quantity)', () => {
    render(<CartItem item={item} />)
    expect(screen.getByText('$259.98')).toBeInTheDocument()
  })

  it('disables the decrease button when quantity is 1', () => {
    render(<CartItem item={{ ...item, quantity: 1 }} />)
    // buttons: [0] Remove, [1] Minus, [2] Plus
    const buttons = screen.getAllByRole('button')
    expect(buttons[1]).toBeDisabled()
  })

  it('disables the increase button when quantity equals inventory', () => {
    render(<CartItem item={{ ...item, quantity: 10 }} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[buttons.length - 1]).toBeDisabled()
  })

  it('calls updateCartItem mutate with increased quantity when + is clicked', async () => {
    render(<CartItem item={item} />)
    const buttons = screen.getAllByRole('button')
    const plusButton = buttons[buttons.length - 1]
    await userEvent.click(plusButton)
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      { productId: 'p-001', quantity: 3 },
      expect.any(Object)
    )
  })

  it('calls updateCartItem mutate with decreased quantity when - is clicked', async () => {
    render(<CartItem item={item} />)
    const buttons = screen.getAllByRole('button')
    const minusButton = buttons[1]
    await userEvent.click(minusButton)
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      { productId: 'p-001', quantity: 1 },
      expect.any(Object)
    )
  })

  it('calls removeFromCart mutate when remove button is clicked', async () => {
    render(<CartItem item={item} />)
    await userEvent.click(screen.getByRole('button', { name: /Remove item/i }))
    expect(mockRemoveMutate).toHaveBeenCalledWith('p-001', expect.any(Object))
  })
})
