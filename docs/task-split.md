# Task Split — BuyMore Hackathon

This document defines ownership, deliverables, and dependencies for each team track. The goal is parallel work that converges on a working demo.

---

## Team Tracks

| Track | Owner area | Primary files |
|---|---|---|
| **Frontend** | UI, pages, hooks, mock layer | `fe/e-commerce/` |
| **Backend** | REST API, services, entities | `be/` |
| **DB Design** | Schema, seed data, migrations | `be/src/main/resources/`, `be/src/main/java/com/buymore/entity/` |
| **Spec / Docs** | SPEC.md, api-contract.md, task-split.md, mvp-scope.md | `SPEC.md`, `docs/` |
| **Build** | Local setup, env examples, README | `README.md`, `be/`, `fe/e-commerce/` |
| **Test** | Unit tests, integration tests, test plan | `be/src/test/`, `fe/e-commerce/__tests__/` |

---

## Track 1 — Frontend

### Goal
A polished, interactive UI that works against both the mock API and the real backend.

### Deliverables

| # | Deliverable | Route / File |
|---|---|---|
| FE-1 | Product listing page | `app/page.tsx` |
| FE-2 | Product detail page | `app/products/[productId]/page.tsx` |
| FE-3 | Cart page | `app/cart/page.tsx` |
| FE-4 | Checkout page | `app/checkout/page.tsx` |
| FE-5 | Order confirmation page | `app/order-confirmation/page.tsx` |
| FE-6 | API service layer + mock layer | `lib/api/` |
| FE-7 | TanStack Query hooks | `lib/hooks/` |
| FE-8 | Cart state | Backed by backend cart API via `X-Session-ID` |
| FE-9 | Shared components (Header, Sidebar, ProductCard, StockBadge, QuantitySelector, CartSummary, EmptyState) | `components/` |
| FE-10 | Checkout form validation (Zod + React Hook Form) | `app/checkout/` |

### Architecture rules to follow
- Pages call hooks only — never call `fetch()` directly.
- Hooks wrap TanStack Query; services call `api-client.ts`.
- Session ID generated in `localStorage` as a UUID v4; passed as `X-Session-ID` header on all cart/order requests.
- All types live in `lib/types/`.
- All query keys in `lib/constants/query-keys.ts`.
- Every data-fetching component handles: loading skeleton, error + retry, empty state, success toast.

### Key dependencies
- Needs `NEXT_PUBLIC_API_URL` pointed at the backend, or mock layer active.
- Cart operations depend on Backend Track delivering `/v1/cart` endpoints.
- Checkout depends on Backend Track delivering `POST /v1/orders`.

---

## Track 2 — Backend

### Goal
A complete, runnable Spring Boot REST API with inventory protection and order persistence.

### Deliverables

| # | Deliverable | File |
|---|---|---|
| BE-1 | `ProductController` — list, categories, detail, related | `controller/ProductController.java` |
| BE-2 | `CartController` — get, add, update, remove, clear | `controller/CartController.java` |
| BE-3 | `OrderController` — place order, get order | `controller/OrderController.java` |
| BE-4 | `ProductService` — filtering, pagination, sort | `service/ProductService.java` |
| BE-5 | `CartService` — cart CRUD, inventory check, pricing | `service/CartService.java` |
| BE-6 | `OrderService` — inventory re-validation, stock decrement, order number, delivery date | `service/OrderService.java` |
| BE-7 | Global exception handler | `exception/GlobalExceptionHandler.java` |
| BE-8 | CORS config (`localhost:3000` + `*.vercel.app`) | `config/CorsConfig.java` |
| BE-9 | `DataSeeder` — 16 products on startup | `DataSeeder.java` |

### Key business logic already implemented
- `CartService.addItem` / `updateItem`: throws `InsufficientInventoryException(HTTP 400)` if requested qty exceeds `product.inventory`.
- `OrderService.placeOrder`: re-validates all items inside `@Transactional`; throws `InsufficientInventoryException(HTTP 409)` on conflict; decrements inventory; clears cart.
- `OrderService.generateOrderNumber`: `BM-{YEAR}-{5-digit-seq}`, resets each year.
- `OrderService.calculateEstimatedDelivery`: order date + 3–5 business days, skipping weekends.
- Pricing (shared between Cart and Order): `taxes = subtotal × 0.08`; `shipping = subtotal >= 100 ? 0 : 9.99`.

### Key dependencies
- Needs DB Track to confirm entity schema (entities drive `ddl-auto=create-drop` in H2).
- Default database is H2 in-memory — no external DB needed for demo.

---

## Track 3 — DB Design

### Goal
Correct JPA entity design, H2-compatible schema, and realistic seed data.

### Deliverables

| # | Deliverable | File |
|---|---|---|
| DB-1 | `Product` entity | `entity/Product.java` |
| DB-2 | `Cart` + `CartItem` entities | `entity/Cart.java`, `entity/CartItem.java` |
| DB-3 | `CustomerOrder` + `OrderItem` + `ShippingAddress` entities | `entity/CustomerOrder.java`, `entity/OrderItem.java`, `entity/ShippingAddress.java` |
| DB-4 | `StringListConverter` (JSON array ↔ TEXT column) | `converter/StringListConverter.java` |
| DB-5 | Repository interfaces with custom JPQL queries | `repository/` |
| DB-6 | Seed data (16 products, 4 categories) | `DataSeeder.java` |

### Schema summary

**`products`**: `id (UUID PK)`, `name`, `description`, `price DECIMAL(10,2)`, `category VARCHAR(100)`, `images TEXT` (JSON), `inventory INT`, `rating DECIMAL(2,1)`, `tags TEXT` (JSON), `is_featured BOOL`, `created_at`, `updated_at`

**`carts`**: `id (UUID PK)`, `session_id VARCHAR(255) UNIQUE`, `created_at`, `updated_at`

**`cart_items`**: `id (UUID PK)`, `cart_id FK`, `product_id FK`, `quantity INT`, unique `(cart_id, product_id)`

**`orders`**: `id (UUID PK)`, `order_number VARCHAR(20) UNIQUE`, `status`, `subtotal`, `taxes`, `shipping`, `total`, `customer_name`, `email`, `phone`, `estimated_delivery DATE`, `created_at`

**`order_items`**: `id (UUID PK)`, `order_id FK`, `product_id FK`, `product_name`, `product_image`, `price`, `quantity` — snapshot at order time

**`shipping_addresses`**: `id (UUID PK)`, `order_id FK (1:1)`, `first_name`, `last_name`, `address`, `city`, `state`, `zip`, `country`

### Notes
- `ddl-auto=create-drop` in H2 — schema is generated from entity annotations. No SQL migration files needed for demo.
- `images` and `tags` stored as JSON strings via `StringListConverter` to keep schema portable (avoids `TEXT[]` array type).
- `CustomerOrder` is named to avoid clash with SQL reserved word `ORDER`.

---

## Track 4 — Spec / Docs

### Goal
Maintain living documentation that keeps all tracks aligned.

### Deliverables

| # | Deliverable | File | Status |
|---|---|---|---|
| SP-1 | Full project specification | `SPEC.md` | Done |
| SP-2 | API contract (this repo's actual API) | `docs/api-contract.md` | Done |
| SP-3 | Task split | `docs/task-split.md` | Done |
| SP-4 | MVP scope | `docs/mvp-scope.md` | Done |

### Responsibilities
- Keep `docs/api-contract.md` in sync as Backend Track evolves endpoints.
- Flag breaking changes (new required headers, changed response shapes) to Frontend Track immediately.
- Maintain the MVP checklist in `docs/mvp-scope.md` as items are completed.

---

## Track 5 — Build

### Goal
Any team member can clone the repo and have a running demo in under 10 minutes.

### Deliverables

| # | Deliverable | File |
|---|---|---|
| BU-1 | Root `README.md` with quick-start instructions | `README.md` |
| BU-2 | Backend env example | `be/src/main/resources/application.properties` (already committed) |
| BU-3 | Frontend env example | `fe/e-commerce/.env.example` |
| BU-4 | Verify `mvn spring-boot:run` works cleanly | — |
| BU-5 | Verify `npm run dev` works cleanly | — |
| BU-6 | Document H2 console access for debugging | `README.md` |

### Quick-start target
```bash
# Terminal 1
cd be && mvn spring-boot:run

# Terminal 2
cd fe/e-commerce
cp .env.example .env.local          # set NEXT_PUBLIC_API_URL=http://localhost:8080/v1
npm install && npm run dev
```

### Key notes
- No Docker, no external database needed for demo — H2 runs in-memory.
- Frontend mock layer: leave `NEXT_PUBLIC_API_URL` unset in `.env.local` to develop without the backend.
- H2 console available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:buymore`).

---

## Track 6 — Test

### Goal
Test coverage for the critical paths: inventory guard, cart operations, order placement, and page rendering.

### Deliverables

| # | Deliverable | File |
|---|---|---|
| TE-1 | Backend unit tests — `ProductService`, `CartService`, `OrderService` | `be/src/test/java/com/buymore/service/` |
| TE-2 | Backend controller tests — `ProductController`, `CartController`, `OrderController` | `be/src/test/java/com/buymore/controller/` |
| TE-3 | Frontend component tests — ProductCard, CartSummary, QuantitySelector | `fe/e-commerce/__tests__/components/` |
| TE-4 | Frontend hook tests — `useProducts`, `useCart` | `fe/e-commerce/__tests__/hooks/` |
| TE-5 | Test plan (all cases) | `SPEC.md` §13 |

### Priority test cases
1. `POST /v1/cart/items` with `quantity > inventory` → 400 `INSUFFICIENT_INVENTORY`
2. `POST /v1/orders` with insufficient stock → 409 `INSUFFICIENT_INVENTORY`
3. `POST /v1/orders` with empty cart → 400 `BAD_REQUEST`
4. Inventory is decremented after successful order
5. `GET /v1/products?category=Footwear` filters correctly
6. `QuantitySelector` disables increment at `inventory` maximum
7. Out-of-stock product renders disabled Add to Cart button
8. Cart totals: tax = 8%, shipping = $9.99 below $100, $0.00 at or above $100

---

## Dependency Timeline

```
Day 1
  DB Design  ──── finalize entity schema ───────────────────────────────▶
  Backend    ──── stand up controllers + services ──────────────────────▶
  Frontend   ──── build pages against mock layer ──────────────────────▶
  Spec/Docs  ──── publish api-contract.md ──────────────────────────────▶
  Build      ──── README + env examples ────────────────────────────────▶

Day 2
  Backend    ──── all endpoints working + seeder running ──────────────▶
  Frontend   ──── switch from mock to real API ─────────────────────────▶
  Test       ──── write + run backend unit tests ───────────────────────▶
  Test       ──── write + run frontend component tests ────────────────▶

Pre-Demo
  All        ──── end-to-end demo run: browse → cart → checkout ────────▶
  All        ──── fix any integration issues ───────────────────────────▶
```

---

## Integration Points (Cross-Track Contracts)

| Contract | Frontend expects | Backend provides |
|---|---|---|
| Session ID | Generates UUID v4, stores in `localStorage`, sends as `X-Session-ID` header | Reads `X-Session-ID` header; auto-creates cart on first request |
| Product list | `{ data: Product[], meta: { page, limit, total, totalPages } }` | `GET /v1/products` |
| Cart state | Full `CartResponse` with `items`, `subtotal`, `taxes`, `shipping`, `total` | All `/v1/cart` endpoints |
| Order placement | `OrderResponse` with `id`, `orderNumber`, `estimatedDelivery` | `POST /v1/orders` |
| Order lookup | Same `OrderResponse` | `GET /v1/orders/{id}` |
| Inventory error on cart | `{ error: "...", code: "INSUFFICIENT_INVENTORY" }` with HTTP 400 | `POST /v1/cart/items`, `PATCH /v1/cart/items/{id}` |
| Inventory error on order | Same shape with HTTP 409 | `POST /v1/orders` |
