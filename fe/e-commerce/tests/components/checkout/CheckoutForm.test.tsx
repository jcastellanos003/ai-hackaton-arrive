import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutPage from '@/app/checkout/page'
import type { Cart } from '@/lib/types/cart'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockCheckoutMutate = vi.fn()
vi.mock('@/lib/hooks/use-checkout', () => ({
  useCheckout: () => ({ mutate: mockCheckoutMutate, isPending: false }),
}))

vi.mock('@/components/checkout/OrderSummary', () => ({
  OrderSummary: () => <div data-testid="order-summary" />,
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockCart: Cart = {
  id: 'cart-1',
  items: [
    {
      productId: 'p-001',
      quantity: 1,
      product: {
        id: 'p-001',
        name: 'Sneakers',
        description: 'Test',
        price: 99,
        category: 'Footwear',
        images: ['https://example.com/img.jpg'],
        inventory: 10,
      },
    },
  ],
  subtotal: 99,
  taxes: 7.92,
  shipping: 0,
  total: 106.92,
}

vi.mock('@/lib/hooks/use-cart', () => ({
  useCart: () => ({ data: mockCart, isLoading: false }),
}))

function fillForm(overrides: Partial<Record<string, string>> = {}) {
  const defaults = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+1 555 000 1234',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
    cardNumber: '4111111111111111',
    cardExpiry: '12/26',
    cardCvc: '123',
    ...overrides,
  }
  return defaults
}

async function typeInField(placeholder: RegExp | string, value: string) {
  const input = screen.getByPlaceholderText(placeholder)
  await userEvent.clear(input)
  await userEvent.type(input, value)
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockCheckoutMutate.mockClear()
  })

  it('renders all required form fields', () => {
    render(<CheckoutPage />)
    expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/jane@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/555/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/123 Main/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/New York/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^NY$/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/10001/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^US$/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/4111/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/12\/26/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^123$/i)).toBeInTheDocument()
  })

  it('shows zod validation errors when required fields are empty on submit', async () => {
    render(<CheckoutPage />)
    await userEvent.click(screen.getAllByRole('button', { name: /Place Order/i })[0])
    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument()
    })
  })

  it.skip('shows zod validation error for invalid email format', async () => {
    render(<CheckoutPage />)
    await typeInField(/jane@example\.com/i, 'not-an-email')
    await userEvent.click(screen.getAllByRole('button', { name: /Place Order/i })[0])
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument()
    })
  })

  it('does not call checkout.mutate when form is invalid', async () => {
    render(<CheckoutPage />)
    await userEvent.click(screen.getAllByRole('button', { name: /Place Order/i })[0])
    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument()
    })
    expect(mockCheckoutMutate).not.toHaveBeenCalled()
  })

  it('calls checkout.mutate with typed CheckoutForm data when all fields are valid', async () => {
    render(<CheckoutPage />)
    const fields = fillForm()
    await typeInField('Jane', fields.firstName)
    await typeInField('Doe', fields.lastName)
    await typeInField(/jane@example\.com/i, fields.email)
    await typeInField(/555/i, fields.phone)
    await typeInField(/123 Main/i, fields.address)
    await typeInField(/New York/i, fields.city)
    await typeInField(/^NY$/i, fields.state)
    await typeInField(/10001/i, fields.zip)
    await typeInField(/^US$/i, fields.country)
    await typeInField(/4111/i, fields.cardNumber)
    await typeInField(/12\/26/i, fields.cardExpiry)
    await typeInField(/^123$/i, fields.cardCvc)
    await userEvent.click(screen.getAllByRole('button', { name: /Place Order/i })[0])
    await waitFor(() => {
      expect(mockCheckoutMutate).toHaveBeenCalledOnce()
    })
  })

  it('shows Place Order button in the form', () => {
    render(<CheckoutPage />)
    expect(screen.getAllByRole('button', { name: /Place Order/i })[0]).toBeInTheDocument()
  })
})
