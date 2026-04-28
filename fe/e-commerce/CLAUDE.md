@AGENTS.md

# CLAUDE.md — BuyMore E-commerce Hackathon

## Project overview

Modern e-commerce web app built for an AI hackathon. The goal is a polished, demo-ready product. Frontend only — a separate teammate handles the backend REST API. When the real API is not ready, use the mock layer.

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + lucide-react icons
- **Data fetching**: TanStack Query v5
- **Notifications**: sonner (toast)

## Project structure

```
src/
  app/                        # Next.js App Router pages
    page.tsx                  # Home / product listing
    products/[productId]/     # Product detail
    cart/                     # Cart
    checkout/                 # Checkout form
    order-confirmation/       # Order success
    layout.tsx                # Root layout (header, providers)

  components/
    layout/                   # Header, Sidebar, Footer
    products/                 # ProductCard, ProductGrid, ProductFilters, HeroBanner
    cart/                     # CartItem, CartSummary, EmptyCart
    checkout/                 # CheckoutForm, OrderSummary
    ui/                       # Re-exported shadcn/ui + custom primitives

  lib/
    api/
      api-client.ts           # Base fetch wrapper (points to NEXT_PUBLIC_API_URL or mock)
      products-service.ts     # getProducts, getProductById, getRelatedProducts
      cart-service.ts         # getCart, addToCart, updateQuantity, removeFromCart
      orders-service.ts       # placeOrder, getOrder
    hooks/
      use-products.ts
      use-product.ts
      use-cart.ts
      use-checkout.ts
    types/
      product.ts
      cart.ts
      order.ts
    utils/
      currency.ts             # formatPrice(amount: number): string
      inventory.ts            # getInventoryStatus, isOutOfStock, canAddToCart
    constants/
      query-keys.ts           # TanStack Query key factory
```

## Architecture rules — ALWAYS follow these

### Layering (strict)

1. **Pages** → call hooks only, no direct API calls
2. **Components** → receive data as props, call hooks for mutations
3. **Hooks** → wrap TanStack Query useQuery/useMutation, import from services
4. **Services** → call api-client, return typed data
5. **api-client** → single fetch wrapper, reads `NEXT_PUBLIC_API_URL`

Never import a service directly in a component or page. Always go through a hook.

### API / Mock layer

- `api-client.ts` checks `NEXT_PUBLIC_API_URL`. If undefined → imports and calls mock functions.
- Mock functions simulate 400–800ms latency with `await delay(ms)`.
- Mock data lives in `lib/api/mock/mock-data.ts` — 12+ realistic products.
- Switching to real API = set `NEXT_PUBLIC_API_URL=https://api.buymore.com` in `.env.local`.

### TanStack Query

- All query keys defined in `constants/query-keys.ts` as a factory object.
- Use `staleTime: 1000 * 60 * 5` for products (5 min).
- Cart queries use `staleTime: 0` (always fresh).
- Optimistic updates on cart mutations — rollback on error.
- Invalidate cart queries after every cart mutation.

### TypeScript

- All types in `lib/types/`. No inline type definitions in components.
- Use `z` (zod) for checkout form validation.
- No `any`. Use `unknown` and narrow.

### Styling

- Use Tailwind utility classes only — no custom CSS files unless absolutely necessary.
- Follow the design reference (BuyMore dashboard screenshot): large rounded cards, soft shadows, spacious layout, clean typography.
- Color palette: white/gray backgrounds, blue/indigo accents, red for destructive actions.
- All cards: `rounded-2xl` with `shadow-sm`.
- Product images: always use `object-cover` inside a fixed-aspect container.
- Responsive: mobile-first. Sidebar collapses on mobile. Grid goes 1→2→3→4 cols.

### Inventory validation

Always use `canAddToCart(product, currentQty, requestedQty)` from `utils/inventory.ts`. Never hardcode inventory checks in components.

### Error & loading states

Every data-fetching component must handle:

- `isLoading` → skeleton loader (use `Skeleton` from shadcn/ui)
- `isError` → error message with retry button
- Empty state → polished empty state illustration + CTA
- Success state (mutations) → toast notification via `sonner`

## Environment variables

```
NEXT_PUBLIC_API_URL=        # Leave empty to use mock API
```

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # ESLint
```

## Design reference

The UI should match the BuyMore dashboard screenshot: sidebar navigation, large product cards with colorful imagery, category filter pills, hero promotional banner, product grid.

## What NOT to do

- Do NOT hardcode business logic in components
- Do NOT call `fetch()` directly in pages or components
- Do NOT create global CSS unless Tailwind cannot handle it
- Do NOT use `useEffect` for data fetching — use TanStack Query
- Do NOT skip loading/error/empty states
- Do NOT use `any` in TypeScript
