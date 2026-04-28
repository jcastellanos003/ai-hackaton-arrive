# MVP Scope — BuyMore Hackathon Demo

This document defines what must work for a successful live demo, what adds polish, and what is explicitly out of scope. Use this as the team's shared definition of done.

---

## Demo Flow (the golden path)

The evaluator will watch this sequence from start to finish:

1. Open `http://localhost:3000`
2. Browse the product grid — see the hero banner, category filters, and search working
3. Notice stock badges on low-stock and out-of-stock products
4. Click a product card → product detail page
5. Select quantity, click **Add to Cart** → toast confirmation
6. Navigate to Cart → see item, adjust quantity, see totals update
7. Click **Proceed to Checkout**
8. Fill in shipping and fake payment details, click **Place Order**
9. Land on Order Confirmation — see order number, items, estimated delivery
10. Click **Continue Shopping** → back to product listing, cart is empty

Every step in this flow must work reliably and look polished.

---

## Must Have — Demo Blockers

Nothing ships to the demo without these. Track as a hard blocker.

### Frontend
- [ ] **FE-M1** Product listing page renders with real API data (or mock)
- [ ] **FE-M2** Hero banner displayed on listing page
- [ ] **FE-M3** Category filter pills narrow the product grid
- [ ] **FE-M4** Search input narrows the product grid
- [ ] **FE-M5** Out of Stock badge on `inventory == 0` products; quick-add disabled
- [ ] **FE-M6** Low Stock badge on `1 <= inventory <= 5` products
- [ ] **FE-M7** Product detail page: image, name, description, price, inventory
- [ ] **FE-M8** Quantity selector respects min (1) and max (`inventory`) bounds
- [ ] **FE-M9** Add to Cart button disabled for out-of-stock products
- [ ] **FE-M10** Add to Cart sends `POST /v1/cart/items` with `X-Session-ID`; shows toast on success
- [ ] **FE-M11** Cart page: item list with image, name, price, quantity controls, line total
- [ ] **FE-M12** Cart: increase/decrease quantity → `PATCH /v1/cart/items/{id}` called
- [ ] **FE-M13** Cart: remove item → `DELETE /v1/cart/items/{id}` called
- [ ] **FE-M14** Cart: order summary shows subtotal, taxes (8%), shipping, total
- [ ] **FE-M15** Cart: empty state shown when cart has no items
- [ ] **FE-M16** Checkout form: shipping + contact fields with required-field validation
- [ ] **FE-M17** Checkout form: fake payment section (card number, expiry, CVV)
- [ ] **FE-M18** Checkout: Place Order calls `POST /v1/orders`; shows loading state
- [ ] **FE-M19** On 409 inventory error at checkout: inline error message shown
- [ ] **FE-M20** Order confirmation: success state, order number, item summary, estimated delivery, Continue Shopping CTA
- [ ] **FE-M21** Cart cleared after successful order
- [ ] **FE-M22** Session ID persisted in `localStorage` across page refreshes

### Backend
- [ ] **BE-M1** `GET /v1/products` returns paginated list with `meta`
- [ ] **BE-M2** `GET /v1/products?category=X` filters by category
- [ ] **BE-M3** `GET /v1/products?search=X` filters by name/description
- [ ] **BE-M4** `GET /v1/products/categories` returns category list with counts
- [ ] **BE-M5** `GET /v1/products/{id}` returns single product; 404 on unknown ID
- [ ] **BE-M6** `GET /v1/products/{id}/related` returns up to 4 same-category products
- [ ] **BE-M7** `GET /v1/cart` returns cart (auto-creates if new session)
- [ ] **BE-M8** `POST /v1/cart/items` adds item; 400 if quantity exceeds inventory
- [ ] **BE-M9** `PATCH /v1/cart/items/{id}` updates quantity; 400 if exceeds inventory
- [ ] **BE-M10** `DELETE /v1/cart/items/{id}` removes item
- [ ] **BE-M11** `DELETE /v1/cart` clears cart
- [ ] **BE-M12** `POST /v1/orders` validates inventory, decrements stock, persists order, clears cart, returns 201
- [ ] **BE-M13** `POST /v1/orders` returns 409 `INSUFFICIENT_INVENTORY` when stock depleted between cart and checkout
- [ ] **BE-M14** `GET /v1/orders/{id}` returns order; 404 on unknown ID
- [ ] **BE-M15** CORS configured to accept `localhost:3000` and `X-Session-ID` header
- [ ] **BE-M16** `DataSeeder` runs on startup, seeding 16 products

### Data / Seed
- [ ] **DB-M1** At least 10 products across at least 3 categories
- [ ] **DB-M2** At least 1 out-of-stock product (`inventory = 0`)
- [ ] **DB-M3** At least 1 low-stock product (`1 <= inventory <= 5`)
- [ ] **DB-M4** At least 2 featured products (`isFeatured = true`)
- [ ] **DB-M5** Product images resolve (Picsum URLs load in browser)

---

## Should Have — Demo Polish

These make the demo visually compelling. Aim to complete them, but don't block the demo.

- [ ] **SH-1** Related products section on detail page (4 same-category products)
- [ ] **SH-2** Sidebar category navigation collapses on mobile
- [ ] **SH-3** Skeleton loaders on product grid during API fetch
- [ ] **SH-4** Toast notifications on cart add/remove/update
- [ ] **SH-5** Free shipping threshold label in cart ("Free shipping on orders over $100")
- [ ] **SH-6** Proceed to Checkout button disabled when cart is empty
- [ ] **SH-7** Product rating displayed on product card and detail page
- [ ] **SH-8** Product tags displayed on product card (e.g., "bestseller", "new", "sale")
- [ ] **SH-9** Sort selector on product listing (`price_asc`, `price_desc`, `rating_desc`, etc.)
- [ ] **SH-10** Responsive layout works at 375 px mobile viewport
- [ ] **SH-11** Page transitions feel smooth (Next.js default or Framer Motion)
- [ ] **SH-12** Checkout form preserves values on re-render (React Hook Form)

---

## Nice to Have — If Time Permits

Complete only after all Must Have and Should Have items are done.

- [ ] **NH-1** `isFeatured` filter on product listing (dedicated "Featured" category pill)
- [ ] **NH-2** Animated cart item entry/removal
- [ ] **NH-3** Image gallery carousel on product detail page
- [ ] **NH-4** Product count badge on category filter pills
- [ ] **NH-5** Playwright E2E test for the full happy path
- [ ] **NH-6** H2 console documented and accessible at `/h2-console` for live debugging during demo
- [ ] **NH-7** `robots.txt` / `sitemap.xml` (for extra realism)

---

## Explicitly Out of Scope

Do not implement these. If asked, say "planned for v2."

| Area | Reason |
|---|---|
| Real payment processing | No Stripe, PayPal, or any gateway. Fake card fields only. |
| User authentication / accounts | No login, no JWT, no session management beyond cart session ID |
| Admin panel | No product/inventory management UI |
| Email notifications | No order confirmation emails |
| Production deployment | No Docker Compose, Kubernetes, CI/CD pipeline |
| PostgreSQL / MySQL | H2 in-memory is sufficient for demo |
| Internationalization | English only |
| Multi-currency | USD only |
| Wish list / saved items | Not in demo |
| Product reviews | Not in demo |
| Discount codes | Not in demo |

---

## Pricing Rules (Final — do not change during hackathon)

| Rule | Value | Location |
|---|---|---|
| Tax rate | 8% of subtotal | `CartService.toResponse()`, `OrderService.placeOrder()` |
| Free shipping threshold | Subtotal ≥ $100.00 → $0.00 shipping | Same |
| Paid shipping | Subtotal < $100.00 → $9.99 | Same |
| Low stock badge threshold | `inventory <= 5 && inventory > 0` | Frontend `utils/inventory.ts` |
| Out of stock threshold | `inventory == 0` | Frontend + Backend |
| Max quantity per add | `product.inventory` (cannot exceed available stock) | Backend enforced, Frontend capped |

---

## Definition of Done — Per Story

A feature is done when:

1. Code compiles without TypeScript errors (frontend) or Maven build errors (backend).
2. The feature works end-to-end with the real backend (not just the mock).
3. Loading, error, and empty states are handled (frontend).
4. No `console.error` output in the browser for the happy path.
5. The feature is visually consistent with the rest of the UI (rounded cards, Tailwind spacing, shadcn/ui components).

---

## Current Status

> Update this table as items are completed.

| Track | Must Have | Should Have | Blockers |
|---|---|---|---|
| Frontend | In progress | Not started | Needs session ID integration |
| Backend | In progress | N/A | — |
| DB Design | Done (entities + seeder) | N/A | — |
| Spec / Docs | Done | N/A | — |
| Build | Not started | N/A | — |
| Test | Not started | N/A | — |
