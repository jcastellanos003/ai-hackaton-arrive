# BuyMore — Project Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Running the App Locally](#running-the-app-locally)
6. [Running Tests](#running-tests)
7. [Features](#features)
8. [API Reference](#api-reference)

---

## Overview

**BuyMore** is an AI-hackathon e-commerce application for browsing products, managing a shopping cart, and placing orders — all without requiring user authentication. It uses a session-based (anonymous) cart tied to a UUID stored in `localStorage`.

The project has two independently runnable parts:

- **`fe/e-commerce/`** — Next.js 16 frontend (App Router, TypeScript, Tailwind CSS)
- **`be/`** — Java 17 / Spring Boot 3 REST API backed by H2 (dev) or PostgreSQL (prod)

---

## Tech Stack

### Frontend

| Category | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI Library | React 19.2.4 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Data Fetching | TanStack Query v5 (`@tanstack/react-query`) |
| Forms | React Hook Form v7 + `@hookform/resolvers` |
| Validation | Zod v4 |
| Component Library | shadcn/ui (`@base-ui/react`) + lucide-react |
| Notifications | sonner v2 |
| Utilities | clsx, tailwind-merge, class-variance-authority, tw-animate-css |
| Package Manager | pnpm |
| Linting | ESLint 9 |

### Backend

| Category | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 (Spring MVC + Spring Data JPA) |
| ORM | Hibernate 6 (via Spring Data JPA) |
| Validation | Jakarta Bean Validation (Hibernate Validator) |
| Database (dev) | H2 in-memory (`create-drop` schema) |
| Database (prod) | PostgreSQL |
| Build | Maven |
| Utilities | Lombok, Jackson |

---

## Architecture

### Frontend Layer Model

The frontend enforces a strict 5-layer architecture. Data always flows top-down; layers never skip each other.

```
Page
  └─ Hook (TanStack Query)
       └─ Service
            └─ api-client
                 ├─ Real API   (when NEXT_PUBLIC_API_URL is set)
                 └─ Mock layer (when NEXT_PUBLIC_API_URL is unset or NEXT_PUBLIC_USE_MOCKS=true)
```

The routing decision is made once at module load time:

```ts
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;
```

Mock modules are dynamically imported on first use and tree-shaken from production builds.

### Frontend Directory Layout

```
fe/e-commerce/
├── app/                                   # Next.js App Router pages
│   ├── layout.tsx                         # Root layout — QueryProvider + Toaster
│   ├── page.tsx                           # Home / product listing
│   ├── products/[productId]/page.tsx      # Product detail page
│   ├── cart/page.tsx                      # Cart page
│   ├── checkout/page.tsx                  # Checkout form (inline, no separate component)
│   └── order-confirmation/page.tsx        # Order success screen
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx                     # Sticky top bar with search + cart badge
│   │   └── Sidebar.tsx                    # Category nav (fixed mobile, sticky desktop)
│   ├── products/
│   │   ├── ProductCard.tsx                # Card + ProductCardSkeleton
│   │   ├── ProductGrid.tsx                # Responsive grid with loading/error/empty states
│   │   ├── ProductFilters.tsx             # Sort dropdown
│   │   └── HeroBanner.tsx                 # Promotional banner
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── EmptyCart.tsx
│   ├── checkout/
│   │   └── OrderSummary.tsx               # Read-only cart summary shown during checkout
│   ├── providers/
│   │   └── QueryProvider.tsx              # TanStack Query client provider
│   └── ui/                                # shadcn/ui primitives (badge, button, card, input, …)
│
└── lib/
    ├── api/
    │   ├── api-client.ts                  # Base fetch wrapper; routes to real or mock
    │   ├── products-service.ts            # getProducts, getProductById, getRelatedProducts, getCategories
    │   ├── cart-service.ts                # getCart, addToCart, updateCartItem, removeFromCart, clearCart
    │   ├── orders-service.ts              # placeOrder, getOrder
    │   └── mock/
    │       ├── mock-data.ts               # 13 seed products (frontend mock only)
    │       ├── mock-products.ts           # Mock products handlers (400–800 ms simulated delay)
    │       ├── mock-cart.ts               # In-memory cart state (module-level Map)
    │       └── mock-orders.ts             # In-memory order store (module-level Map)
    ├── hooks/
    │   ├── use-products.ts                # useProducts, useCategories
    │   ├── use-product.ts                 # useProduct, useRelatedProducts
    │   ├── use-cart.ts                    # useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart
    │   └── use-checkout.ts               # useCheckout, useOrder
    ├── types/
    │   ├── product.ts                     # Product, Category, ProductFilters, ProductsResponse
    │   ├── cart.ts                        # CartItem, Cart
    │   └── order.ts                       # checkoutFormSchema (Zod), CheckoutForm, OrderItem, Order
    ├── utils/
    │   ├── currency.ts                    # formatPrice(amount: number): string
    │   ├── inventory.ts                   # getInventoryStatus, isOutOfStock, canAddToCart
    │   └── session.ts                     # getSessionId() — localStorage UUID, "ssr-session" on server
    └── constants/
        └── query-keys.ts                  # TanStack Query key factory (single source of truth)
```

### Backend Directory Layout

```
be/
├── pom.xml
└── src/main/
    ├── java/com/buymore/
    │   ├── BuyMoreApplication.java        # Entry point (@SpringBootApplication)
    │   ├── DataSeeder.java                # Seeds 16 products on first startup
    │   ├── config/
    │   │   └── CorsConfig.java            # CORS rules for /v1/**
    │   ├── controller/
    │   │   ├── ProductController.java     # /v1/products
    │   │   ├── CartController.java        # /v1/cart
    │   │   └── OrderController.java       # /v1/orders
    │   ├── service/
    │   │   ├── ProductService.java
    │   │   ├── CartService.java
    │   │   └── OrderService.java
    │   ├── entity/
    │   │   ├── Product.java
    │   │   ├── Cart.java
    │   │   ├── CartItem.java
    │   │   ├── CustomerOrder.java         # Named CustomerOrder to avoid SQL keyword ORDER
    │   │   ├── OrderItem.java
    │   │   └── ShippingAddress.java
    │   ├── dto/                           # Request / response DTOs
    │   ├── repository/                    # Spring Data JPA repositories
    │   ├── exception/
    │   │   ├── GlobalExceptionHandler.java
    │   │   ├── ResourceNotFoundException.java
    │   │   └── InsufficientInventoryException.java
    │   └── converter/
    │       └── StringListConverter.java   # Stores List<String> as JSON text column
    └── resources/
        └── application.properties
```

### Session Management

- The frontend (`lib/utils/session.ts`) generates a UUID v4 on first client visit and persists it under the key `buymore_session_id` in `localStorage`.
- On the server side (SSR), it returns the literal string `"ssr-session"` — the real UUID is only available client-side.
- Every cart and order request attaches the header `X-Session-ID: <uuid>`.
- The backend creates a `Cart` row automatically on first use (transparent to the client).
- There is no expiry; the session persists until `localStorage` is cleared.

### TanStack Query Cache Policy

| Resource | staleTime |
|---|---|
| Products / Product detail / Related products | 5 minutes |
| Categories | 10 minutes |
| Cart | 0 (always fresh) |
| Orders | 10 minutes |

Cart mutations (`useUpdateCartItem`, `useRemoveFromCart`) use optimistic updates with automatic rollback on error. `useAddToCart` sets query data directly from the returned cart response.

### Mock Layer Notes (frontend only)

- Mock cart state is held in a **module-level `Map`** — it persists across client-side navigation but resets on dev-server restart.
- Mock orders are also module-level; order numbers use a per-session sequence starting at 1.
- Mock API calls include a simulated 400–800 ms delay to mimic network latency.
- The mock layer has 13 seed products; the real backend seeds 16.

---

## Database Schema

The backend persists data in five tables. In development the schema is created automatically on startup (`ddl-auto=create-drop`). In production, target PostgreSQL and set `ddl-auto=update`.

### `products`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, default `gen_random_uuid()` | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | NOT NULL | |
| price | DECIMAL(10,2) | NOT NULL, CHECK > 0 | USD |
| category | VARCHAR(100) | NOT NULL | e.g. `"Footwear"`, `"Clothing"` |
| images | TEXT[] | NOT NULL, min 1 item | Array of image URLs |
| inventory | INTEGER | NOT NULL, default 0, CHECK >= 0 | |
| rating | DECIMAL(2,1) | nullable, CHECK 1–5 | |
| tags | TEXT[] | nullable | e.g. `["new", "sale"]` |
| is_featured | BOOLEAN | NOT NULL, default false | |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | |

Indexes: `category`, `is_featured`, `inventory` (for low-stock queries).

> In the Java backend `images` and `tags` are stored as JSON text via `StringListConverter` to stay DB-agnostic.

---

### `carts`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| session_id | VARCHAR(255) | UNIQUE, NOT NULL | Client UUID from `localStorage` |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | |

---

### `cart_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| cart_id | UUID | FK → `carts.id` ON DELETE CASCADE | |
| product_id | UUID | FK → `products.id` | |
| quantity | INTEGER | NOT NULL, CHECK > 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | |

Unique constraint: `(cart_id, product_id)` — one row per product per cart.

---

### `orders`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| order_number | VARCHAR(20) | UNIQUE, NOT NULL | e.g. `BM-2024-00042` |
| status | VARCHAR(50) | NOT NULL, default `'pending'` | `pending / processing / shipped / delivered / cancelled` |
| subtotal | DECIMAL(10,2) | NOT NULL | |
| taxes | DECIMAL(10,2) | NOT NULL | |
| shipping | DECIMAL(10,2) | NOT NULL | |
| total | DECIMAL(10,2) | NOT NULL | |
| customer_name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL | |
| phone | VARCHAR(50) | nullable | |
| estimated_delivery | DATE | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |

---

### `order_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| order_id | UUID | FK → `orders.id` ON DELETE CASCADE | |
| product_id | UUID | FK → `products.id` | |
| product_name | VARCHAR(255) | NOT NULL | Snapshot at time of order |
| product_image | TEXT | NOT NULL | First image URL snapshot |
| price | DECIMAL(10,2) | NOT NULL | Price at time of order |
| quantity | INTEGER | NOT NULL, CHECK > 0 | |

---

### `shipping_addresses`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| order_id | UUID | FK → `orders.id` ON DELETE CASCADE, UNIQUE | One-to-one with order |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| address | VARCHAR(255) | NOT NULL | |
| city | VARCHAR(100) | NOT NULL | |
| state | VARCHAR(100) | NOT NULL | |
| zip | VARCHAR(20) | NOT NULL | |
| country | VARCHAR(100) | NOT NULL | |

---

## Running the App Locally

### Prerequisites

- Node.js ≥ 18 and pnpm (`npm install -g pnpm`) — for the frontend
- Java 17+ and Maven — for the backend

---

### Frontend

```bash
# 1. Navigate to the frontend directory
cd fe/e-commerce

# 2. Install dependencies
pnpm install

# 3. (Optional) Create a local environment file
#    Omit NEXT_PUBLIC_API_URL to run against the built-in mock API (no backend required)
#    Point to the backend to use the real API
cp .env.example .env.local
# or manually: echo "NEXT_PUBLIC_API_URL=http://localhost:8080/v1" > .env.local

# 4. Start the development server
pnpm dev
```

The app is available at **http://localhost:3000**.

| Script | Command | Description |
|---|---|---|
| Dev server | `pnpm dev` | Hot-reload development server |
| Production build | `pnpm build` | Compile and optimise for production (outputs standalone bundle for Docker) |
| Production server | `pnpm start` | Serve the production build |
| Lint | `pnpm lint` | Run ESLint |

#### Frontend Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend including the version prefix, e.g. `http://localhost:8080/v1`. Leave empty to use the mock layer. |
| `NEXT_PUBLIC_USE_MOCKS` | Set to `"true"` to force the mock layer even when `NEXT_PUBLIC_API_URL` is set. |

Both variables absent → mock mode. Either variable absent → mock mode.

A ready-to-use template is provided at `fe/e-commerce/.env.example`.

#### Allowed Remote Image Hosts

`next.config.ts` whitelists the following hosts for `next/image`:
- `images.unsplash.com`
- `plus.unsplash.com`
- `picsum.photos`

---

### Backend

```bash
# Development — run directly with Maven (uses H2 in-memory DB, auto-seeded)
cd be
mvn spring-boot:run

# Or build a runnable JAR first
mvn package -DskipTests
java -jar target/buymore-api-0.0.1-SNAPSHOT.jar
```

The API is available at **http://localhost:8080/v1**.  
The H2 console (dev only) is available at **http://localhost:8080/h2-console** — JDBC URL: `jdbc:h2:mem:buymore`, username: `sa`, no password.

> The database schema is created fresh on every start (`ddl-auto=create-drop`), and 16 seed products are inserted automatically.

#### Switching to PostgreSQL

Override these properties (e.g. via environment variables or a `application-prod.properties` file):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/buymore
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=<user>
spring.datasource.password=<pass>
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

A template for all backend properties is provided at `be/src/main/resources/application.properties.example`.

---

## Docker Compose (local demo)

Starts the full stack with a single command — no local Java or Node install required.

```bash
docker compose up --build
```

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:3000            |
| Backend  | http://localhost:8080/v1         |
| H2 Console (dev) | http://localhost:8080/h2-console |

Stop and remove containers:

```bash
docker compose down
```

The backend uses H2 in-memory by default inside the container (same as local dev). Data is reset each time the container restarts. See `docker-compose.yml` for details.

---

### Running Both Together (quick copy-paste)

```bash
# Terminal 1 — Backend
cd be && mvn spring-boot:run

# Terminal 2 — Frontend
cd fe/e-commerce
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/v1" > .env.local
pnpm install
pnpm dev
```

---

## Running Tests

### Frontend

Test infrastructure has not been set up yet. No test framework is configured and no test files exist.

When tests are added, the recommended approach is:
- **Unit / hook tests** — Vitest + React Testing Library
- **E2E tests** — Playwright
- **Run command** — `pnpm test` (to be configured in `package.json`)

### Backend

```bash
cd be
mvn test
```

Spring Boot's test starter is included in the project. No custom tests have been written yet.

---

## Features

### Product Catalog

- **16 products** seeded on backend startup across four categories: Footwear (5), Clothing (5), Accessories (3), Bags (3). The spec requires a minimum of 12 (4+ Footwear, 4+ Clothing, 2+ Accessories, 2+ Bags).
- **Search** — case-insensitive substring match across product name and description.
- **Filtering** — filter by category via sidebar; "All Products" resets the filter.
- **Sorting** — `price_asc`, `price_desc`, `name_asc`, `rating_desc`, `created_at_desc` (default).
- **Featured flag** — 6 products are marked `isFeatured` for hero/promotional placement.
- **Inventory states** — out of stock (0 units), low stock (1–4 units), in stock (5+).
- **Inventory badges** — product cards show "Out of stock" (red) or "Only N left" (amber) overlays.
- **Pagination** — `page` + `limit` query params (default 20, max 100 per page).

### Product Detail Page

- Image gallery with thumbnail row (shown when the product has more than one image).
- Quantity stepper capped at `product.inventory − currentCartQty`.
- Inventory status badge and "Add to cart" button (disabled when out of stock).
- Related products in a horizontal scrollable row (up to 4, same category).
- Wishlist (heart) button is a UI placeholder — no backend or state logic.

### Shopping Cart

- **No login required** — cart is tied to an anonymous session UUID in `localStorage`.
- **Inventory enforcement** — adding more than available stock returns a `400 Bad Request` error: `"Only N items left in stock"`.
- **Optimistic UI** — quantity updates and removals appear instantly and roll back on failure.
- **Computed pricing**:
  - `taxes` = subtotal × 8%
  - `shipping` = free for orders ≥ $100, otherwise $9.99
  - `total` = subtotal + taxes + shipping

### Checkout

- Entire checkout form is implemented in `app/checkout/page.tsx` (no separate `CheckoutForm` component).
- **Shipping fields:** First name, Last name, Email, Phone, Address, City, State, ZIP, Country — all required.
- **Payment fields (demo only):** Card number, Expiry (`MM/YY`), CVC. Any values that pass validation are accepted; no real payment processing occurs.
- Validation uses Zod (`checkoutFormSchema` from `lib/types/order.ts`) via React Hook Form on the frontend; the backend enforces the same rules via Jakarta Bean Validation.
- An empty-cart guard prevents submission if the cart has no items.
- On success, navigates to `/order-confirmation?orderId=<id>`.

### Order Confirmation

- Human-readable order number: `BM-{YEAR}-{NNNNN}` (e.g. `BM-2026-00001`), unique per calendar year.
- Visual status timeline: Confirmed → Preparing → On the way.
- Estimated delivery shown as a human-readable date (e.g. "Monday, May 5"), calculated as 3–5 business days from order placement (weekends excluded).
- Item list with thumbnails, quantity badges, and per-line totals.
- Price breakdown with subtotal, taxes (8%), and shipping (shown as "Free" when $0).
- **Track order** button is disabled with a "Coming soon" label.

### UI / UX

- Responsive product grid: 1 column (mobile) → 2 (sm) → 3 (lg) → 4 (xl) columns.
- Skeleton loaders on all async data (product cards, cart, product detail).
- Error states with retry buttons.
- Empty states with calls to action.
- Toast notifications (sonner, `top-right`, rich colors) for cart events.
- Sidebar: fixed overlay on mobile; sticky column on desktop (lg+).
- Header: sticky, backdrop-blur, cart icon with live item-count badge (shows `99+` above 99).
- App title: **BuyMore — Shop the Look**.
- Font: Geist (variable, latin subset).
- "Request for product" and "Log out" in the sidebar are UI-only placeholders with no handlers.

---

## API Reference

| Environment | Base URL |
|---|---|
| Local (Spring Boot) | `http://localhost:8080/v1` |
| Production | `https://api.buymore.com/v1` |

**All endpoints return JSON. Error responses always have the shape:**
```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

**Required headers:**

| Header | Required on | Value |
|---|---|---|
| `Content-Type` | POST / PATCH requests | `application/json` |
| `X-Session-ID` | `/cart` and `POST /orders` | Client-generated UUID |

**CORS allowed origins:** `http://localhost:3000`, `https://*.vercel.app`

---

### Products

#### `GET /v1/products`

Returns a paginated, filterable list of products.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 20 | Items per page (max 100) |
| `category` | string | — | Filter by category name |
| `search` | string | — | Substring search across name + description |
| `is_featured` | boolean | — | Return only featured products |
| `sort` | string | `created_at_desc` | `price_asc`, `price_desc`, `name_asc`, `rating_desc`, `created_at_desc` |

**Response `200 OK`:**
```json
{
  "data": [ { "...product": "fields" } ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 16,
    "totalPages": 1
  }
}
```

---

#### `GET /v1/products/categories`

Returns all category names with their product counts.

**Response `200 OK`:**
```json
{
  "data": [
    { "name": "Footwear",    "count": 5 },
    { "name": "Clothing",    "count": 5 },
    { "name": "Accessories", "count": 3 },
    { "name": "Bags",        "count": 3 }
  ]
}
```

---

#### `GET /v1/products/{id}`

Returns a single product by UUID.

**Response `200 OK`:** `{ ...product }`

**Errors:**
- `404` — `{ "error": "Product not found", "code": "PRODUCT_NOT_FOUND" }`

---

#### `GET /v1/products/{id}/related`

Returns up to 4 products in the same category (excluding the requested product).

**Response `200 OK`:** `{ "data": [ { ...product } ] }`

---

### Cart

All cart endpoints require the `X-Session-ID` header. The backend creates a cart automatically on first use.

#### `GET /v1/cart`

Returns the full cart with computed pricing.

**Response `200 OK`:**
```json
{
  "id": "uuid",
  "items": [
    {
      "productId": "uuid",
      "product": { "...product": "fields" },
      "quantity": 2
    }
  ],
  "subtotal": 99.98,
  "taxes": 8.00,
  "shipping": 0.00,
  "total": 107.98
}
```

---

#### `POST /v1/cart/items`

Adds a product to the cart, or increments its quantity if already present.

**Request body:**
```json
{ "productId": "uuid", "quantity": 1 }
```

**Response `200 OK`:** Updated `CartResponse` (same shape as `GET /cart`).

**Errors:**
- `400` — `{ "error": "Only N items left in stock", "code": "INSUFFICIENT_INVENTORY" }`

---

#### `PATCH /v1/cart/items/{productId}`

Updates the quantity of a specific cart item.

**Request body:**
```json
{ "quantity": 3 }
```

**Response `200 OK`:** Updated `CartResponse`.

**Errors:**
- `400` — `{ "error": "Only N items left in stock", "code": "INSUFFICIENT_INVENTORY" }`
- `404` — `{ "error": "Item not in cart", "code": "CART_ITEM_NOT_FOUND" }`

---

#### `DELETE /v1/cart/items/{productId}`

Removes a specific item from the cart.

**Response `200 OK`:** Updated `CartResponse`.

**Errors:**
- `404` — `{ "error": "Cart item not found", "code": "CART_ITEM_NOT_FOUND" }`

---

#### `DELETE /v1/cart`

Clears all items from the cart.

**Response `200 OK`:** `{ "message": "Cart cleared" }`

---

### Orders

#### `POST /v1/orders`

Places an order from the current cart contents. Requires `X-Session-ID` header.

**Request body:**
```json
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
    "cardExpiry": "12/26",
    "cardCvc": "123"
  }
}
```

All `shipping` fields except `phone` are required (`@NotBlank`). `payment` fields are required but not processed.

On success, the backend:
1. Re-validates and atomically decrements inventory for every item (`@Transactional`).
2. Calculates pricing (subtotal, 8% taxes, $9.99 or free shipping).
3. Snapshots product names and prices into `OrderItem` rows (immutable history).
4. Generates an order number (`BM-{YEAR}-{NNNNN}`).
5. Clears the cart.

**Response `201 Created`:**
```json
{
  "id": "uuid",
  "orderNumber": "BM-2026-00001",
  "status": "processing",
  "estimatedDelivery": "2026-05-02",
  "items": [
    {
      "productId": "uuid",
      "productName": "Canvas Weekender Duffel",
      "productImage": "https://picsum.photos/seed/canvas-weekender/400/400",
      "price": 110.00,
      "quantity": 1
    }
  ],
  "subtotal": 110.00,
  "taxes": 8.80,
  "shipping": 0.00,
  "total": 118.80,
  "customerName": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2026-04-28T14:30:00Z"
}
```

**Errors:**
- `400` — empty cart: `{ "error": "Cart is empty", "code": "BAD_REQUEST" }`
- `400` — validation failure: `{ "error": "field errors joined by \"; \"", "code": "VALIDATION_ERROR" }`
- `409` — insufficient stock: `{ "error": "Only N items left in stock", "code": "INSUFFICIENT_INVENTORY" }`

---

#### `GET /v1/orders/{id}`

Returns a previously placed order by UUID.

**Response `200 OK`:** Same shape as the `POST /v1/orders` response body.

**Errors:**
- `404` — `{ "error": "Order not found", "code": "ORDER_NOT_FOUND" }`
