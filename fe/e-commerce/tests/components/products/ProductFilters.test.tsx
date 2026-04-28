import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductFilters } from '@/components/products/ProductFilters'

vi.mock('@/lib/hooks/use-products', () => ({
  useCategories: () => ({
    data: {
      data: [
        { name: 'Footwear', count: 4 },
        { name: 'Clothing', count: 4 },
        { name: 'Accessories', count: 2 },
      ],
    },
    isLoading: false,
  }),
}))

describe('ProductFilters', () => {
  it('renders an "All" pill', () => {
    render(
      <ProductFilters
        activeCategory="All"
        search=""
        onCategoryChange={vi.fn()}
        onSearchChange={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })

  it('renders a filter pill for each available category', () => {
    render(
      <ProductFilters
        activeCategory="All"
        search=""
        onCategoryChange={vi.fn()}
        onSearchChange={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Footwear' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clothing' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accessories' })).toBeInTheDocument()
  })

  it('calls onCategoryChange with the selected category when a pill is clicked', async () => {
    const onCategoryChange = vi.fn()
    render(
      <ProductFilters
        activeCategory="All"
        search=""
        onCategoryChange={onCategoryChange}
        onSearchChange={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Footwear' }))
    expect(onCategoryChange).toHaveBeenCalledWith('Footwear')
  })

  it('calls onCategoryChange with "All" when the All pill is clicked', async () => {
    const onCategoryChange = vi.fn()
    render(
      <ProductFilters
        activeCategory="Footwear"
        search=""
        onCategoryChange={onCategoryChange}
        onSearchChange={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(onCategoryChange).toHaveBeenCalledWith('All')
  })

  it('renders a search input', () => {
    render(
      <ProductFilters
        activeCategory="All"
        search=""
        onCategoryChange={vi.fn()}
        onSearchChange={vi.fn()}
      />
    )
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument()
  })

  it('calls onSearchChange as the user types', async () => {
    const onSearchChange = vi.fn()
    render(
      <ProductFilters
        activeCategory="All"
        search=""
        onCategoryChange={vi.fn()}
        onSearchChange={onSearchChange}
      />
    )
    await userEvent.type(screen.getByPlaceholderText(/Search/i), 'sne')
    expect(onSearchChange).toHaveBeenCalledTimes(3)
    expect(onSearchChange).toHaveBeenLastCalledWith('e')
  })
})
