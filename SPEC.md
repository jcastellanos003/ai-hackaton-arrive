# AI Hackathon E-Commerce Portal — Software Specification

---

## 1. Project Overview

**BuyMore — Shop the Look.** A demo-ready, full-stack e-commerce application built for an AI Hackathon. The application showcases a realistic online shopping experience — product browsing, cart management, fake checkout, and order confirmation — using a modern Next.js frontend, a Java Spring Boot REST backend, and an H2 in-memory database.

**Current state:** Both frontend (`fe/e-commerce`) and backend (`be`) are implemented and integrated. A `docker-compose.yml` is available for a single-command full-stack startup. The frontend supports three run modes:
- **Mock mode** (default when `NEXT_PUBLIC_API_URL` is not set) — uses an in-process mock layer with simulated network delay; no backend required.
- **Real API mode** — set `NEXT_PUBLIC_API_URL=http://localhost:8080/v1` in `.env.local` to connect to the live Spring Boot backend.
- **Docker Compose** — `docker compose up --build` starts frontend, backend, and H2 together with no local Java or Node install required.

The goal is a polished, functional demo that can be stood up and demonstrated end-to-end without external service dependencies.

---

## 2. Goals and Non-Goals

### Goals
- Build a working shopping flow: browse → product detail → cart → checkout → confirmation.
- Demonstrate real inventory tracking (stock badges, quantity guards).
- Provide a clean, professional UI suitable for a live demo.
- Keep the backend and database self-contained and easy to seed.
- Establish a clear monorepo structure that all team members can navigate independently.

### Non-Goals
- Real payment processing (no Stripe, PayPal, or any payment gateway).
- User authentication or account management.
- Admin panel or product management UI.
- Email notifications or order tracking system.
- Production deployment, SSL certificates, or CDN configuration.
- Mobile-native app (responsive web only).
- Internationalization or multi-currency support.

---

## 3. User Roles

| Role | Description |
|---|---|
| **Anonymous Shopper** | The only user type. Browses products, manages a cart stored in session/local storage, and completes a fake checkout. No login required. |

---

## 4. User Journeys

### Journey 1 — Browse and Discover
1. Shopper lands on the **Product Listing Page**.
2. Views the hero banner and product grid.
3. Filters products by category or searches by name.
4. Sees stock badges on low/out-of-stock items.

### Journey 2 — View Product Detail
1. Shopper clicks a product card.
2. Lands on the **Product Detail Page**.
3. Views images, description, price, and available inventory.
4. Selects quantity (capped by available stock).
5. Clicks **Add to Cart**; button is disabled when stock is 0.

### Journey 3 — Manage Cart
1. Shopper navigates to the **Cart Page**.
2. Reviews items, adjusts quantities, or removes items.
3. Sees live subtotal, estimated tax, shipping, and order total.
4. Proceeds to checkout.

### Journey 4 — Fake Checkout
1. Shopper fills in shipping and contact information.
2. Enters fake payment details (no real validation).
3. Clicks **Place Order**.
4. Frontend POSTs order to backend; backend validates inventory.
5. On success, redirected to **Order Confirmation Page**.

### Journey 5 — Order Confirmation
1. Shopper sees a success message with a generated order number.
2. Views a summary of purchased items and an estimated delivery date.
3. Clicks **Continue Shopping** to return to the product listing.

---

## 5. Functional Requirements

### 5.1 Product Listing Page
| ID | Requirement |
|---|---|
| PL-01 | Display a full-width hero banner with a promotional headline and CTA button. |
| PL-02 | Display a horizontal list of product category filter buttons. |
| PL-03 | Provide a text search input that filters the product grid in real time (client-side). |
| PL-04 | Display products in a responsive grid (1 / 2 / 3 / 4 columns depending on viewport). |
| PL-05 | Each product card shows: product image, name, price, category tag, and available inventory count. |
| PL-06 | Show a **Low Stock** badge when `inventory <= 5` and `inventory > 0`. |
| PL-07 | Show an **Out of Stock** badge and disable the quick-add button when `inventory == 0`. |
| PL-08 | Quick-add button on a card adds 1 unit to cart without navigating away. |
| PL-09 | Clicking a card (anywhere except the quick-add button) navigates to the product detail page. |
| PL-10 | Category filter and search can be combined (AND logic). |

### 5.2 Product Detail Page
| ID | Requirement |
|---|---|
| PD-01 | Display a primary product image with thumbnail gallery (minimum 1 image required). |
| PD-02 | Display product name, description, price (formatted as currency), and category. |
| PD-03 | Display available inventory count. |
| PD-04 | Show a numeric quantity selector defaulting to 1; minimum is 1, maximum is `product.inventory − quantity already in cart` for that product. |
| PD-05 | **Add to Cart** button is disabled and shows "Out of Stock" when `inventory == 0`. |
| PD-06 | Clicking **Add to Cart** adds the selected quantity to the cart and shows a brief toast notification. |
| PD-07 | Display a **Related Products** section showing up to 4 products from the same category (excluding current). |
| PD-08 | Breadcrumb navigation back to the product listing page. |

### 5.3 Cart Page
| ID | Requirement |
|---|---|
| CA-01 | List all items currently in the cart with: product image, name, unit price, quantity controls, line total. |
| CA-02 | Quantity increment button is disabled when quantity equals available inventory. |
| CA-03 | Quantity decrement button is disabled when quantity equals 1. |
| CA-04 | Remove button deletes the line item from the cart with an undo option (3-second window). |
| CA-05 | Display order summary: subtotal, taxes (8% of subtotal), shipping ($9.99, free when subtotal ≥ $100), and total — values sourced from the backend `CartResponse`. |
| CA-06 | Display an **Empty Cart** state with a CTA to continue shopping when the cart has no items. |
| CA-07 | Cart item count shown in the site header/navigation badge. |
| CA-08 | **Proceed to Checkout** button is disabled when the cart is empty. |
| CA-09 | If a product's inventory changes between adding to cart and checkout, show a warning and cap the quantity. |

### 5.4 Fake Checkout Page
| ID | Requirement |
|---|---|
| CH-01 | Shipping form fields: First Name, Last Name, Address Line 1, Address Line 2 (optional), City, State, ZIP Code, Country. |
| CH-02 | Contact information fields: Email, Phone (optional). |
| CH-03 | Fake payment section with fields: Card Number, Expiry (MM/YY), CVV, Cardholder Name (no real validation beyond format checks). |
| CH-04 | Order summary sidebar showing cart items, subtotal, tax, shipping, and total. |
| CH-05 | All required fields validated on submit; inline error messages displayed. |
| CH-06 | Card number field accepts 16 digits (display formatted as XXXX XXXX XXXX XXXX). |
| CH-07 | Expiry field rejects past dates. |
| CH-08 | **Place Order** button shows a loading state during the API call. |
| CH-09 | On backend success, navigate to the Order Confirmation page. |
| CH-10 | On backend inventory error, surface a specific error message ("One or more items are no longer available in the requested quantity."). |

### 5.5 Order Confirmation Page
| ID | Requirement |
|---|---|
| OC-01 | Display a success icon and headline ("Order Confirmed!"). |
| OC-02 | Display a generated order number (returned from the backend). |
| OC-03 | Display a list of purchased items with name, quantity, and line price. |
| OC-04 | Display an estimated delivery date returned from the backend (`3–5 business days`, weekends excluded). Rendered as a human-readable date (e.g. "Monday, May 5"). |
| OC-05 | Display order total. |
| OC-06 | **Continue Shopping** button navigates back to the product listing page. |
| OC-07 | Cart is cleared upon successful order placement. |

---

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF-01 | Frontend initial page load under 3 seconds on a local dev server. |
| NF-02 | All API responses under 300 ms for typical seed data volumes (≤ 100 products). |
| NF-03 | Responsive layout supporting viewports from 375 px (mobile) to 1440 px (desktop). |
| NF-04 | No real payment data stored or transmitted anywhere. |
| NF-05 | Frontend and backend can be started independently with a single command each. |
| NF-06 | H2 schema is auto-created from JPA entities on startup; 16 products are seeded by `DataSeeder` on first run — no external DB or SQL scripts needed. |
| NF-07 | Codebase compiles without errors and all defined tests pass before demo. |
| NF-08 | Environment secrets (DB credentials, API URL) sourced from `.env` files — never hardcoded. |

---

## 7. Frontend Specification

### 7.1 Tech Stack
| Concern | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Component library | shadcn/ui (Base UI primitives) + lucide-react icons |
| Server state / data fetching | TanStack Query v5 |
| Form handling | React Hook Form v7 + Zod v4 |
| Toast notifications | Sonner v2 |
| Cart state | Server-side (Spring Boot) — identified by `X-Session-ID` UUID header |
| HTTP client | `fetch` via `api-client.ts`; auto-routes to mock layer when `NEXT_PUBLIC_API_URL` is unset |
| Package manager | pnpm (pnpm-workspace) |

### 7.2 Page Routes

| Route | Component | Description |
|---|---|---|
| `/` | `ProductListingPage` | Hero, filters, search, product grid |
| `/products/[id]` | `ProductDetailPage` | Full product info, add to cart |
| `/cart` | `CartPage` | Cart items, order summary |
| `/checkout` | `CheckoutPage` | Forms, fake payment, place order |
| `/order-confirmation?orderId={uuid}` | `OrderConfirmationPage` | Success state, order summary (fetches order by query param) |

### 7.3 Key Components

| Component | Location | Purpose |
|---|---|---|
| `Header` | `components/layout/` | Sticky top bar with live search input and cart badge (`99+` cap) |
| `Sidebar` | `components/layout/` | Category navigation — fixed overlay on mobile, sticky column on desktop |
| `ProductCard` / `ProductCardSkeleton` | `components/products/` | Product tile with inventory badge; skeleton for loading state |
| `ProductGrid` | `components/products/` | Responsive 1→2→3→4 column grid with loading, error, and empty states |
| `ProductFilters` | `components/products/` | Sort dropdown (price, name, rating, newest); category pills and search input |
| `HeroBanner` | `components/products/` | Promotional hero block on the listing page |
| `CartItem` | `components/cart/` | Single cart row with quantity controls and remove button |
| `CartSummary` | `components/cart/` | Subtotal / tax / shipping / total breakdown |
| `EmptyCart` | `components/cart/` | Empty state with CTA back to shop |
| `OrderSummary` | `components/checkout/` | Read-only cart summary shown in the checkout sidebar |
| `QueryProvider` | `components/providers/` | TanStack Query client setup and DevTools |

### 7.4 TanStack Query Keys & Cache Policy

Keys defined in `lib/constants/query-keys.ts`:

```typescript
queryKeys.products.all              // ["products"]
queryKeys.products.list(filters)    // ["products", "list", filters]
queryKeys.products.detail(id)       // ["products", "detail", id]
queryKeys.products.related(id, cat) // ["products", "related", id, category]
queryKeys.products.categories       // ["products", "categories"]
queryKeys.cart.all                  // ["cart"]
queryKeys.orders.detail(id)         // ["orders", "detail", id]
```

Cache policy:

| Resource | `staleTime` |
|---|---|
| Products / Product detail / Related | 5 minutes |
| Categories | 10 minutes |
| Cart | 0 — always refetch |
| Orders | 10 minutes |

Cart mutations: `useUpdateCartItem` and `useRemoveFromCart` use **optimistic updates** with automatic rollback on error. `useAddToCart` sets query data directly from the returned `CartResponse`.

### 7.5 Session Identity & Cart State

The cart is fully server-side. There is no client-side cart store (no Zustand).

`lib/utils/session.ts` generates a UUID v4 on first load and persists it in `localStorage` under the key `buymore_session_id`. This ID is sent as `X-Session-ID` on every cart and order request. The backend auto-creates a cart for new session IDs.

```typescript
// lib/types/cart.ts
type CartItem = {
  productId: string;   // UUID
  product: Product;    // full product snapshot
  quantity: number;
};

type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
};
```

Cart queries use `staleTime: 0` (always refetch). All cart mutations invalidate `queryKeys.cart.all`.

**Mock layer differences** (active when `NEXT_PUBLIC_API_URL` is unset):
- 13 seed products (vs 16 in the real backend seeder)
- Cart and order state held in **module-level Maps** — persists across client-side navigation but resets on dev-server restart
- Simulated 400–800 ms latency per call
- Mock modules are dynamically imported and tree-shaken from production builds

### 7.6 Environment Variables (Frontend)

```env
# fe/e-commerce/.env.local

# Point at the real backend. Leave unset to use the mock layer.
NEXT_PUBLIC_API_URL=http://localhost:8080/v1

# Force mock mode even when API_URL is set (optional, for development)
NEXT_PUBLIC_USE_MOCKS=false
```

Mock mode is active when `NEXT_PUBLIC_API_URL` is unset **or** `NEXT_PUBLIC_USE_MOCKS=true`. Mocks simulate 400–800 ms of network latency and mirror the real API response shapes exactly.

### 7.7 Styling Conventions
- Tailwind CSS v4: CSS-first configuration via `globals.css` (`@theme` directive). There is no `tailwind.config.ts`.
- Use Tailwind utility classes exclusively; no custom CSS files other than `globals.css`.
- shadcn/ui components customised via `components.json` only.
- All cards: `rounded-2xl shadow-sm`. Product images: `object-cover` inside a fixed-aspect container.
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- Font: Geist (variable, latin subset, loaded via `next/font`).

---

## 8. Backend API Specification

### 8.1 Tech Stack
| Concern | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Build tool | Maven 3.6+ |
| Database | H2 in-memory (default); PostgreSQL switchable via properties |
| Database access | Spring Data JPA + Hibernate 6 |
| Validation | Jakarta Bean Validation (Hibernate Validator) |
| JSON | Jackson (camelCase, `NON_NULL` serialization) |
| Utilities | Lombok |
| CORS | `CorsConfig.java` — allows `localhost:3000` and `*.vercel.app`; exposes `X-Session-ID` header |

### 8.2 Base URL
```
http://localhost:8080/v1
```

### 8.3 Response Shapes

There is no single success/error wrapper. Response shapes vary by endpoint:

**Product list** (`GET /v1/products`):
```json
{
  "data": [ { /* ProductResponse */ } ],
  "meta": { "page": 1, "limit": 20, "total": 16, "totalPages": 1 }
}
```

**Single product, cart, order** — the object itself is returned directly (no outer wrapper):
```json
{ "id": "uuid", "name": "...", ... }
```

**All errors** — flat two-field envelope:
```json
{ "error": "Only 3 items left in stock", "code": "INSUFFICIENT_INVENTORY" }
```

Jackson is configured with `NON_NULL` — nullable fields (`rating`, `tags`, `phone`) are omitted from responses when null.

### 8.4 Endpoints

All IDs are UUIDs. All cart and order endpoints require the `X-Session-ID: <uuid>` header.

#### Products

**GET /v1/products** — paginated product list

| Query param | Default | Description |
|---|---|---|
| `page` | `1` | 1-based page number |
| `limit` | `20` | Items per page (max 100) |
| `category` | — | Exact category name |
| `search` | — | Full-text filter on name and description |
| `is_featured` | — | `true` to return only featured products |
| `sort` | `created_at_desc` | `price_asc`, `price_desc`, `name_asc`, `rating_desc` |

Response `200`: `{ data: ProductResponse[], meta: { page, limit, total, totalPages } }`

**GET /v1/products/categories** — category list with counts

Response `200`: `{ data: [ { name: "Footwear", count: 5 }, ... ] }`

> Must be declared before `/:id` — Spring matches the literal path `categories` first.

**GET /v1/products/{id}** — single product

Response `200`: `ProductResponse`; `404`: `PRODUCT_NOT_FOUND`

**GET /v1/products/{id}/related** — up to 4 products in the same category (excluding `{id}`)

Response `200`: `{ data: ProductResponse[] }`

```json
// ProductResponse shape
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Urban Runner Pro Sneakers",
  "description": "High-performance running sneakers...",
  "price": 89.99,
  "category": "Footwear",
  "images": ["https://picsum.photos/seed/sneaker1/400/400"],
  "inventory": 25,
  "rating": 4.8,
  "tags": ["bestseller"],
  "isFeatured": true
}
```

---

#### Cart

Cart is fully server-side. All endpoints require `X-Session-ID`. A cart is auto-created on first request.

| Method | Path | Description |
|---|---|---|
| GET | `/v1/cart` | Current cart with computed totals |
| POST | `/v1/cart/items` | Add item — body: `{ productId, quantity }` |
| PATCH | `/v1/cart/items/{productId}` | Set quantity — body: `{ quantity }` |
| DELETE | `/v1/cart/items/{productId}` | Remove item |
| DELETE | `/v1/cart` | Clear all items |

All cart mutation responses return the updated `CartResponse`. `POST /v1/cart/items` returns `400 INSUFFICIENT_INVENTORY` if the requested quantity exceeds stock.

```json
// CartResponse shape
{
  "id": "cart-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "product": { /* full ProductResponse */ },
      "quantity": 2
    }
  ],
  "subtotal": 179.98,
  "taxes": 14.40,
  "shipping": 0.00,
  "total": 194.38
}
```

---

#### Orders

**POST /v1/orders** — place order (requires `X-Session-ID`)

Backend flow: fetch cart → re-validate inventory inside `@Transactional` → decrement stock → persist order → clear cart → return 201.

```json
// Request body
{
  "shipping": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "555-0100",
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "US"
  },
  "payment": {
    "cardNumber": "4111111111111111",
    "cardExpiry": "12/27",
    "cardCvc": "123"
  }
}
```

Required shipping fields: `firstName`, `lastName`, `email`, `address`, `city`, `state`, `zip`, `country`. `phone` is required by the Zod frontend schema but is optional on the backend (`@NotBlank` is not set).

Payment fields are accepted as-is — no real processing occurs.

```json
// OrderResponse (201)
{
  "id": "order-uuid",
  "orderNumber": "BM-2026-00001",
  "status": "processing",
  "items": [
    {
      "productId": "product-uuid",
      "productName": "Urban Runner Pro Sneakers",
      "productImage": "https://picsum.photos/seed/sneaker1/400/400",
      "price": 89.99,
      "quantity": 2
    }
  ],
  "subtotal": 179.98,
  "taxes": 14.40,
  "shipping": 0.00,
  "total": 194.38,
  "customerName": "Jane Doe",
  "email": "jane@example.com",
  "estimatedDelivery": "2026-05-05",
  "createdAt": "2026-04-28T14:32:00Z"
}
```

Response `409 INSUFFICIENT_INVENTORY`: stock depleted between cart and checkout.
Response `400 BAD_REQUEST`: cart is empty.
Response `400 VALIDATION_ERROR`: missing required fields.

**GET /v1/orders/{id}** — retrieve order by UUID (used by confirmation page)

Response `200`: `OrderResponse`; `404`: `ORDER_NOT_FOUND`

---

### 8.5 Error Codes

| Code | HTTP Status | Trigger |
|---|---|---|
| `PRODUCT_NOT_FOUND` | 404 | Product UUID does not exist |
| `CART_ITEM_NOT_FOUND` | 404 | Item not in cart on update/remove |
| `ORDER_NOT_FOUND` | 404 | Order UUID does not exist |
| `INSUFFICIENT_INVENTORY` | 400 | Cart add/update exceeds available stock |
| `INSUFFICIENT_INVENTORY` | 409 | Order placement — stock depleted between cart and checkout |
| `VALIDATION_ERROR` | 400 | Bean Validation failure on request body |
| `BAD_REQUEST` | 400 | e.g. placing order with empty cart |
| `INTERNAL_ERROR` | 500 | Unhandled exception (detail not exposed to client) |

### 8.6 Service Layer Structure

```
ProductService
  - getProducts(page, limit, category, search, isFeatured, sort) → ProductListResponse
  - getProductById(UUID id) → ProductResponse
  - getRelatedProducts(UUID id) → List<ProductResponse>
  - getCategories() → CategoryResponse

CartService
  - getCart(sessionId) → CartResponse         // auto-creates cart
  - addItem(sessionId, productId, qty)        // 400 if qty > inventory
  - updateItem(sessionId, productId, qty)     // 400 if qty > inventory
  - removeItem(sessionId, productId)
  - clearCart(sessionId)
  - toResponse(Cart) → CartResponse           // computes subtotal/taxes/shipping

OrderService
  - placeOrder(sessionId, OrderRequest) → OrderResponse  // @Transactional
  - getOrder(UUID id) → OrderResponse
  - generateOrderNumber() → "BM-{YEAR}-{5-digit-seq}"
  - calculateEstimatedDelivery(orderDate) → LocalDate    // +3–5 business days
```

### 8.7 Environment Variables (Backend)

Default `be/src/main/resources/application.properties` uses H2 — no changes needed for demo:

```properties
server.port=8080

# H2 in-memory (default — no external DB required)
spring.datasource.url=jdbc:h2:mem:buymore;DB_CLOSE_DELAY=-1;NON_KEYWORDS=ORDER
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

To switch to PostgreSQL, override these four properties (env vars or a local properties file):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/buymore
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=<user>
spring.datasource.password=<pass>
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## 9. Database Design Specification

The schema is managed entirely through JPA entity annotations. `ddl-auto=create-drop` on H2 means the schema is created fresh on every startup — no SQL migration files are needed for the demo.

### 9.1 Entity Summary

| Table | Entity class | Notes |
|---|---|---|
| `products` | `Product` | UUID PK; `images` and `tags` stored as JSON strings via `StringListConverter` to avoid DB-specific array types |
| `carts` | `Cart` | UUID PK; `session_id VARCHAR UNIQUE` ties to the browser session |
| `cart_items` | `CartItem` | UUID PK; FK → `carts` + FK → `products`; unique `(cart_id, product_id)` |
| `orders` | `CustomerOrder` | Named `CustomerOrder` to avoid clash with SQL reserved word `ORDER`; UUID PK |
| `order_items` | `OrderItem` | Snapshot of `product_name`, `product_image`, `price` at order time |
| `shipping_addresses` | `ShippingAddress` | One-to-one with `orders` |

### 9.2 Key Column Details

**`products`**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `name` | VARCHAR(255) | |
| `description` | TEXT | |
| `price` | DECIMAL(10,2) | |
| `category` | VARCHAR(100) | `Footwear`, `Clothing`, `Accessories`, `Bags` |
| `images` | TEXT | JSON array via `StringListConverter`, e.g. `["url1","url2"]` |
| `inventory` | INT | Default 0; decremented on order |
| `rating` | DECIMAL(2,1) | Nullable, 1.0–5.0 |
| `tags` | TEXT | JSON array via `StringListConverter`, nullable |
| `is_featured` | BOOLEAN | Default false |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

**`orders`**

| Column | Type | Notes |
|---|---|---|
| `order_number` | VARCHAR(20) UNIQUE | Format: `BM-YYYY-00042` |
| `status` | VARCHAR(50) | `processing` on creation |
| `subtotal` / `taxes` / `shipping` / `total` | DECIMAL(10,2) | |
| `estimated_delivery` | DATE | 3–5 business days after order date |

### 9.3 Seed Data

`DataSeeder.java` seeds **16 products** across 4 categories on first startup (skips if any products exist):

| Category | Count | Stock variety |
|---|---|---|
| Footwear | 5 | 1 out-of-stock (`inventory=0`), 1 low-stock (`inventory=3`) |
| Clothing | 5 | 1 low-stock (`inventory=2`), rest 15–50 |
| Accessories | 3 | 1 low-stock (`inventory=1`) |
| Bags | 3 | 1 out-of-stock (`inventory=0`) |

All product images use `https://picsum.photos/seed/{slug}/400/400` URLs. See §17 for a known issue with the `next.config.ts` image domain allowlist.

---

## 10. Validation and Business Rules

| Rule | Location | Detail |
|---|---|---|
| Quantity minimum | Frontend + Backend | `quantity >= 1` always |
| Quantity maximum (add to cart) | Frontend + Backend | Frontend caps at `product.inventory`; backend enforces via `400 INSUFFICIENT_INVENTORY` |
| Inventory check on add to cart | Backend | `CartService.addItem/updateItem` rejects if `newQty > product.inventory` (HTTP 400) |
| Inventory check on order | Backend | `OrderService.placeOrder` re-validates all items inside `@Transactional`; rejects with `409` if any item has insufficient stock |
| Inventory decrement | Backend | `product.inventory -= quantity` per item, saved atomically in the same transaction as the order |
| Tax rate | Backend | `taxes = subtotal × 0.08` (8%), rounded to 2 decimal places |
| Shipping | Backend | `shipping = subtotal >= 100.00 ? $0.00 : $9.99` |
| Total | Backend | `total = subtotal + taxes + shipping` |
| Card fields | Frontend only | `cardNumber` (16 digits), `cardExpiry` (MM/YY regex), `cardCvc` (3–4 digits) — validated by Zod, sent to backend as-is, no processing |
| Required checkout fields | Frontend (Zod) + Backend (Bean Validation) | `firstName`, `lastName`, `email`, `address`, `city`, `state`, `zip`, `country`; `phone` required by frontend Zod schema, optional on backend |
| Order number format | Backend | `BM-{YYYY}-{5-digit-zero-padded-sequence}` — sequence counts orders placed in the current calendar year |
| Estimated delivery | Backend | Order date + 3–5 business days (random within range, weekends skipped) |
| Low stock badge | Frontend | `inventory <= 5 && inventory > 0` (constant `LOW_STOCK_THRESHOLD = 5` in `utils/inventory.ts`) |
| Out of stock | Frontend + Backend | `inventory <= 0`; frontend disables Add to Cart; backend refuses cart add |

---

## 11. Error Handling

### Frontend
- **Network error / 5xx**: Show a full-page `ErrorBoundary` with a "Something went wrong" message and a retry button.
- **404 product**: Redirect to `/` with a toast notification.
- **409 inventory conflict on checkout**: Highlight the conflicting cart items in red, show an inline message, and disable **Place Order** until the cart is corrected.
- **400 validation errors from API**: Map field errors to the relevant form fields via React Hook Form's `setError`.
- **Empty search results**: Show an inline "No products found" state within the grid area, not a full-page error.

### Backend
All exceptions are handled by `GlobalExceptionHandler` (`@RestControllerAdvice`). Every error response has the shape `{ "error": "...", "code": "..." }`.

| Exception | HTTP | Code |
|---|---|---|
| `ResourceNotFoundException` | 404 | Code carried by the exception (`PRODUCT_NOT_FOUND`, `CART_ITEM_NOT_FOUND`, `ORDER_NOT_FOUND`) |
| `InsufficientInventoryException` | 400 (cart) / 409 (order) | `INSUFFICIENT_INVENTORY` — HTTP status is set on the exception at throw site |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_ERROR` — field error messages joined by `"; "` |
| `IllegalArgumentException` | 400 | `BAD_REQUEST` — used for empty-cart checkout |
| Any other `Exception` | 500 | `INTERNAL_ERROR` — details logged server-side only |

---

## 12. Build and Deployment Notes

### Prerequisites
| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | |
| pnpm | 9+ | `npm i -g pnpm` if not installed |
| Java JDK | 17+ | |
| Maven | 3.6+ | |

No external database required — H2 runs in-memory by default.

### Option A — Mock mode (frontend only, no backend needed)

```bash
cd fe/e-commerce
pnpm install
pnpm dev
# App at http://localhost:3000 — built-in mock layer, 13 seed products
```

### Option B — Full stack (two terminals)

**Terminal 1 — Backend**
```bash
cd be
mvn spring-boot:run
# API at http://localhost:8080/v1
# H2 console at http://localhost:8080/h2-console  (JDBC: jdbc:h2:mem:buymore, user: sa, password: blank)
```

**Terminal 2 — Frontend**
```bash
cd fe/e-commerce
cp .env.example .env.local        # then set NEXT_PUBLIC_API_URL=http://localhost:8080/v1
pnpm install
pnpm dev
# App at http://localhost:3000
```

### Option C — Docker Compose (all-in-one, no local Java or Node required)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/v1 |
| H2 Console | http://localhost:8080/h2-console |

```bash
docker compose down   # stop and remove containers
```

Data resets on container restart (H2 in-memory, same as local dev).

### Environment Variable Reference

**`fe/e-commerce/.env.local`** (copy from `.env.example`)
```env
# Connect to real backend (leave unset to use mock layer)
NEXT_PUBLIC_API_URL=http://localhost:8080/v1

# Force mock mode even when API_URL is set (optional)
# NEXT_PUBLIC_USE_MOCKS=true
```

### Other useful commands

```bash
# Frontend
pnpm build    # production build (outputs standalone bundle)
pnpm start    # serve the production build
pnpm lint     # ESLint

# Backend
mvn package -DskipTests          # build runnable JAR
java -jar target/buymore-api-0.0.1-SNAPSHOT.jar
mvn test                         # run backend tests
```

---

## 13. Test Plan

> **Current status:** No test infrastructure is configured and no test files exist yet. The cases below are the target test plan. When tests are added, the recommended frontend stack is **Vitest + React Testing Library**; run with `pnpm test`. Backend uses Spring Boot Test (`mvn test`).

### 13.1 Frontend Tests (Vitest + React Testing Library — planned)

| ID | Area | Test Case | Expected Result |
|---|---|---|---|
| FE-01 | Product Listing | Renders product grid with seeded data | All product cards visible |
| FE-02 | Product Listing | Search input filters cards by name | Only matching products shown |
| FE-03 | Product Listing | Category filter updates grid | Only products of selected category shown |
| FE-04 | Product Listing | Out-of-stock badge renders on inventory=0 product | Badge displayed, quick-add button disabled |
| FE-05 | Product Listing | Low-stock badge renders on inventory≤5 product | Badge displayed |
| FE-06 | Product Detail | Quick-add from listing adds item to cart state | Cart item count increments by 1 |
| FE-07 | Product Detail | Quantity selector cannot go below 1 | Decrement button disabled at min |
| FE-08 | Product Detail | Quantity selector cannot exceed available inventory | Increment button disabled at max |
| FE-09 | Product Detail | Add to Cart disabled for out-of-stock product | Button rendered as disabled |
| FE-10 | Cart | Displays all added items with correct totals | Line totals and order summary correct |
| FE-11 | Cart | Remove item with undo — undo within 3 s restores item | Item reappears |
| FE-12 | Cart | Remove item — undo expires — item gone | Item absent after 3 s |
| FE-13 | Cart | Free shipping threshold: subtotal >= $100 shows $0 shipping | Shipping line shows "Free" |
| FE-14 | Cart | Empty cart state shown when all items removed | Empty state component rendered |
| FE-15 | Checkout | Required field validation on submit | Errors shown on blank required fields |
| FE-16 | Checkout | Invalid card number format rejected | Inline error on card number field |
| FE-17 | Checkout | Past expiry date rejected | Inline error on expiry field |
| FE-18 | Order Confirmation | Estimated delivery date rendered from backend-computed `estimatedDelivery` field | Correct date displayed in human-readable format |
| FE-19 | Cart State | Cart re-fetched after page refresh using same `X-Session-ID` from localStorage | Items still in cart on reload |

### 13.2 Backend Tests (Spring Boot Test — planned, no tests written yet)

| ID | Area | Test Case | Expected Result |
|---|---|---|---|
| BE-01 | Product API | GET /products returns all products | 200 with list |
| BE-02 | Product API | GET /products?category=Footwear filters correctly | Only footwear products returned |
| BE-03 | Product API | GET /products?q=sneakers filters by name | Only matching products returned |
| BE-04 | Product API | GET /products/{id} returns correct product | 200 with product data |
| BE-05 | Product API | GET /products/{id} for non-existent ID | 404 PRODUCT_NOT_FOUND |
| BE-06 | Product API | GET /products/categories returns category list | 200 with distinct category names |
| BE-07 | Cart | POST /v1/cart/items adds item when quantity <= inventory | 200 CartResponse, item present |
| BE-08 | Cart | POST /v1/cart/items with quantity > inventory | 400 INSUFFICIENT_INVENTORY |
| BE-09 | Cart | PATCH /v1/cart/items/{id} updates quantity | 200 CartResponse with new quantity |
| BE-10 | Cart | DELETE /v1/cart/items/{id} removes item | 200 CartResponse without item |
| BE-11 | Cart | DELETE /v1/cart clears all items | 200 `{ message: "Cart cleared" }` |
| BE-12 | Order | POST /v1/orders with valid data and sufficient stock | 201, inventory decremented, cart cleared |
| BE-13 | Order | POST /v1/orders with insufficient stock | 409 INSUFFICIENT_INVENTORY |
| BE-14 | Order | POST /v1/orders with empty cart | 400 BAD_REQUEST |
| BE-15 | Order | POST /v1/orders with missing required field | 400 VALIDATION_ERROR |
| BE-16 | Order | GET /v1/orders/{id} returns correct order | 200 with order data |
| BE-17 | Order | GET /v1/orders/{id} for non-existent ID | 404 ORDER_NOT_FOUND |
| BE-18 | Price Calc | Subtotal >= $100 computes $0 shipping | Shipping = 0 in response |
| BE-19 | Price Calc | Subtotal < $100 computes $9.99 shipping | Shipping = 9.99 in response |
| BE-20 | Price Calc | Tax calculated as 8% of subtotal | Tax = subtotal × 0.08 |

### 13.3 Integration / End-to-End (Playwright — stretch goal)

| ID | Flow | Steps | Expected Result |
|---|---|---|---|
| E2E-01 | Happy path | Browse → add to cart → checkout → confirm | Order confirmation page with order number |
| E2E-02 | Out-of-stock guard | Add max inventory → try to add 1 more → checkout | Increment button disabled on detail page |
| E2E-03 | Empty cart guard | Navigate to /cart with no items | Empty state shown, proceed to checkout disabled |
| E2E-04 | Form validation | Submit checkout with blank fields | All required-field errors shown |

---

## 14. Actual Folder Structure

```
ai-hackaton-arrive/
├── fe/e-commerce/                          # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx                      # Root layout (Header, QueryProvider, Toaster)
│   │   ├── page.tsx                        # Product listing (/, sidebar + grid)
│   │   ├── products/[productId]/page.tsx   # Product detail
│   │   ├── cart/page.tsx                   # Cart
│   │   ├── checkout/page.tsx               # Checkout form
│   │   └── order-confirmation/page.tsx     # Confirmation (?orderId=UUID)
│   ├── components/
│   │   ├── ui/                             # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── Header.tsx                  # Search bar, cart badge
│   │   │   └── Sidebar.tsx                 # Category navigation (collapsible mobile)
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx             # Skeleton states, error, empty states
│   │   │   ├── ProductFilters.tsx          # Sort dropdown + category pills + search input
│   │   │   └── HeroBanner.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── EmptyCart.tsx
│   │   ├── checkout/
│   │   │   └── OrderSummary.tsx            # Sticky sidebar on checkout page
│   │   └── providers/
│   │       └── QueryProvider.tsx           # TanStack Query client setup
│   ├── lib/
│   │   ├── api/
│   │   │   ├── api-client.ts               # Central fetch wrapper; mock vs real routing
│   │   │   ├── products-service.ts
│   │   │   ├── cart-service.ts             # Attaches X-Session-ID header
│   │   │   ├── orders-service.ts
│   │   │   └── mock/
│   │   │       ├── mock-data.ts            # 13 seed products (frontend mock only)
│   │   │       ├── mock-products.ts
│   │   │       ├── mock-cart.ts
│   │   │       └── mock-orders.ts
│   │   ├── hooks/
│   │   │   ├── use-products.ts
│   │   │   ├── use-product.ts
│   │   │   ├── use-cart.ts
│   │   │   └── use-checkout.ts             # Also exports useOrder
│   │   ├── types/
│   │   │   ├── product.ts
│   │   │   ├── cart.ts
│   │   │   └── order.ts                    # Includes checkoutFormSchema (Zod)
│   │   ├── utils/
│   │   │   ├── currency.ts                 # formatPrice()
│   │   │   ├── inventory.ts                # LOW_STOCK_THRESHOLD, getInventoryStatus, canAddToCart
│   │   │   └── session.ts                  # getSessionId() → localStorage UUID
│   │   └── constants/
│   │       └── query-keys.ts               # TanStack Query key factory
│   ├── next.config.ts                      # output: standalone; image domains: unsplash.com, picsum.photos
│   ├── package.json                        # pnpm; Next 16, React 19, TanStack Query v5
│   └── pnpm-workspace.yaml
│
├── be/                                     # Spring Boot backend
│   ├── pom.xml
│   └── src/main/java/com/buymore/
│       ├── BuyMoreApplication.java
│       ├── DataSeeder.java                 # Seeds 16 products on first startup
│       ├── config/CorsConfig.java
│       ├── converter/StringListConverter.java  # List<String> ↔ JSON TEXT column
│       ├── controller/
│       │   ├── ProductController.java      # /v1/products
│       │   ├── CartController.java         # /v1/cart
│       │   └── OrderController.java        # /v1/orders
│       ├── service/
│       │   ├── ProductService.java
│       │   ├── CartService.java
│       │   └── OrderService.java
│       ├── repository/
│       │   ├── ProductRepository.java      # Custom JPQL: findWithFilters, findCategoryCounts
│       │   ├── CartRepository.java
│       │   ├── CartItemRepository.java
│       │   ├── OrderRepository.java
│       │   └── OrderItemRepository.java
│       ├── entity/
│       │   ├── Product.java
│       │   ├── Cart.java
│       │   ├── CartItem.java
│       │   ├── CustomerOrder.java          # Named to avoid SQL keyword clash
│       │   ├── OrderItem.java
│       │   └── ShippingAddress.java
│       ├── dto/
│       │   ├── ProductResponse.java
│       │   ├── ProductListResponse.java    # Includes Meta
│       │   ├── CategoryResponse.java
│       │   ├── CartResponse.java           # Includes CartItemResponse inner class
│       │   ├── CartItemRequest.java
│       │   ├── UpdateCartItemRequest.java
│       │   ├── OrderRequest.java           # Includes ShippingInfo + PaymentInfo inner classes
│       │   ├── OrderResponse.java          # Includes OrderItemResponse inner class
│       │   └── ErrorResponse.java          # { "error": "...", "code": "..." }
│       └── exception/
│           ├── GlobalExceptionHandler.java
│           ├── ResourceNotFoundException.java
│           └── InsufficientInventoryException.java
│
├── docs/
│   ├── api-contract.md                     # Detailed API reference
│   ├── task-split.md                       # Per-track deliverables
│   └── mvp-scope.md                        # Prioritised checklist
│
├── docker-compose.yml                      # Full-stack container setup (FE + BE + H2)
├── demo.md                                 # Demo overview and feature summary
├── SPEC.md
└── README.md
```

---

## 15. MVP Scope for Hackathon Demo

The following represents the minimum shippable set to deliver a compelling live demo.

### Must Have (Demo Blockers)
- [ ] Product listing page with search, category filter, and stock badges
- [ ] Product detail page with quantity selector and add-to-cart
- [ ] Cart page with quantity controls, remove, and order summary
- [ ] Checkout page with form validation and loading state
- [ ] Order confirmation page with order number and summary
- [ ] `GET /v1/products`, `GET /v1/products/{id}`, `GET /v1/products/categories`
- [ ] `GET /v1/cart`, `POST /v1/cart/items`, `PATCH /v1/cart/items/{id}`, `DELETE /v1/cart/items/{id}`
- [ ] `POST /v1/orders` with inventory re-validation and stock decrement
- [ ] `GET /v1/orders/{id}`
- [ ] H2 seeder runs on startup with ≥ 10 products across ≥ 3 categories (already implemented)
- [ ] CORS configured for `localhost:3000` (already implemented)
- [ ] `X-Session-ID` header handled by backend; session UUID generated and persisted by frontend

### Should Have (Demo Polish)
- [x] Hero banner on listing page
- [x] Related products section on detail page
- [x] Low Stock / Out of Stock inventory badges
- [x] Toast notifications on cart actions (Sonner, top-right)
- [x] Free shipping threshold messaging in cart summary
- [x] Responsive layout (mobile through 4-column desktop)
- [x] Skeleton loaders on product grid and all async data
- [x] Docker Compose single-command startup

### Nice to Have (If Time Permits)
- [ ] Playwright E2E happy-path test
- [ ] Animated cart drawer instead of separate cart page
- [ ] Smooth page transitions

### Out of Scope
- User authentication
- Real payment processing
- Admin product management
- Email notifications
- Production deployment

---

## 16. Future Improvements

| Area | Improvement |
|---|---|
| Auth | Add NextAuth.js for user accounts, order history, and saved addresses |
| Payments | Integrate Stripe Checkout in test mode |
| Search | Replace client-side filter with Elasticsearch or Typesense for full-text search at scale |
| Inventory | Add optimistic locking (`@Version`) or pessimistic DB locks to handle concurrent purchases |
| Performance | Add Redis cache for product catalog reads |
| Images | Replace placeholder URLs with a real CDN (Cloudflare Images, AWS S3 + CloudFront) |
| Admin | Build a product management UI for CRUD operations and inventory adjustments |
| Reviews | Add a product reviews and ratings system |
| Wishlist | Persist a wishlist per user session or account |
| Observability | Add structured logging (Logback + JSON), metrics (Micrometer + Prometheus), and distributed tracing |
| CI/CD | Add GitHub Actions pipeline: lint → test → build → Docker image push |
| Containerisation | Extend `docker-compose.yml` to include a PostgreSQL service for production-like local testing |
| Mobile App | React Native app sharing the same backend API |

---

---

## 17. Known Issues and Integration Notes

| # | Area | Issue | Resolution |
|---|---|---|---|
| ~~KI-01~~ | ~~Frontend images~~ | ~~`next.config.ts` did not allowlist `picsum.photos`~~ | **Resolved.** `picsum.photos` is now listed in `remotePatterns` alongside `images.unsplash.com` and `plus.unsplash.com`. |
| KI-02 | Cart session | The frontend `session.ts` returns the string `"ssr-session"` when `window` is undefined (server-side render). Cart requests made during SSR will all share the same backend cart. | Cart mutations are client-only — `"use client"` pages prevent SSR cart calls in practice. No action required for demo. |
| KI-03 | H2 data loss | All data (products, carts, orders) is lost when the backend process restarts because `ddl-auto=create-drop` drops and recreates the schema on every boot. | Expected for demo. Products are re-seeded automatically. Carts and orders are reset — inform demo audience. |
| KI-04 | Concurrent inventory | `OrderService.placeOrder` uses `@Transactional` but does not use optimistic locking (`@Version`). Under concurrent load two users could both pass the inventory check and oversell. | Acceptable for hackathon demo. Add `@Version` to `Product` for production use. |
| KI-05 | Phone field validation mismatch | Frontend Zod schema marks `phone` as required (`z.string().min(1)`). Backend `OrderRequest.ShippingInfo` does not annotate `phone` with `@NotBlank`, so it is optional server-side. | Intentional: frontend collects phone for UX, backend treats it as optional. No code change needed. |
| KI-06 | Demo flow — mock vs real API | When switching from mock to real API (`NEXT_PUBLIC_API_URL` set), the session cart in the backend will be empty (new session). Users must re-add items. | Communicate to demo audience; restart backend and clear localStorage if a clean state is needed. |
| KI-07 | UI placeholders | Wishlist (heart) button on product detail page and sidebar "Request for product" / "Log out" links have no handler — they are visual placeholders only. | Expected for hackathon MVP. Do not click during demo or warn the audience. |
| KI-08 | Track order disabled | "Track order" button on the order confirmation page is permanently disabled with a "Coming soon" label. | Expected. No order tracking backend is planned for MVP. |
| KI-09 | No frontend tests | Test infrastructure (Vitest, React Testing Library) has not been configured. No test files exist. | Planned addition. See §13 for the target test plan. |

---

## 18. Demo Script

The recommended live demo sequence (golden path):

1. Open `http://localhost:3000` — product grid loads with hero banner.
2. Click a category filter pill — grid narrows to that category.
3. Type in the search box — grid filters in real time.
4. Point out **Low Stock** and **Out of Stock** badges.
5. Click a product card → detail page.
6. Adjust quantity, click **Add to Cart** — toast confirms; header badge increments.
7. Navigate to **Cart** — item list and order summary visible.
8. Adjust quantity up/down; show that the increment button disables at stock limit.
9. Click **Proceed to Checkout**.
10. Fill in the shipping form and the fake card fields (any values work).
11. Click **Place Order** — loading spinner shows, then redirects to confirmation.
12. Order confirmation shows order number (`BM-YYYY-00001`), items, and estimated delivery date.
13. Click **Continue Shopping** — cart is empty, back to listing.

---

*Document version: 2.1 — synced with README.md, demo.md, and latest repo state, April 2026.*

**v2.1 changes:** Added Docker Compose run option (§1, §12); fixed PD-04 quantity max formula; corrected OC-01 headline and OC-04 delivery date source; updated §7.1 component library; revised §7.3 component table to match actual files; added TanStack Query cache policy table and mock-layer notes to §7.4–7.5; corrected Tailwind v4 config convention in §7.7; fixed Node.js prerequisite to ≥ 18 (§12); added `.env.example` copy step and `pnpm start`/`mvn test` commands; flagged §13 as not-yet-implemented and updated stack to Vitest; fixed folder structure comments and added `docker-compose.yml`/`demo.md` to tree; marked all Should Have items as implemented in §15; removed Docker Compose from §16 future improvements; resolved KI-01 (picsum.photos now allowlisted); added KI-07–09 (UI placeholders, track order disabled, no frontend tests).*
