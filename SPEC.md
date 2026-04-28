# AI Hackathon E-Commerce Portal — Software Specification

---

## 1. Project Overview

A demo-ready, full-stack e-commerce application built for an AI Hackathon. The application showcases a realistic online shopping experience — product browsing, cart management, fake checkout, and order confirmation — using a modern frontend, Java REST backend, and MySQL database. The goal is a polished, functional demo that can be stood up quickly and demonstrated end-to-end without external service dependencies.

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
| PD-04 | Show a numeric quantity selector defaulting to 1; minimum is 1, maximum is `min(available inventory, 10)`. |
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
| CA-05 | Display order summary: subtotal, estimated tax (fixed 10%), flat shipping ($4.99, free if subtotal > $75), and total. |
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
| OC-01 | Display a success icon and headline ("Order Placed!"). |
| OC-02 | Display a generated order number (returned from the backend). |
| OC-03 | Display a list of purchased items with name, quantity, and line price. |
| OC-04 | Display an estimated delivery date (current date + 5 business days, computed client-side). |
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
| NF-06 | MySQL schema can be initialised and seeded with a single SQL script. |
| NF-07 | Codebase compiles without errors and all defined tests pass before demo. |
| NF-08 | Environment secrets (DB credentials, API URL) sourced from `.env` files — never hardcoded. |

---

## 7. Frontend Specification

### 7.1 Tech Stack
| Concern | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Component library | shadcn/ui |
| Server state / data fetching | TanStack Query v5 |
| Form handling | React Hook Form + Zod |
| Toast notifications | shadcn/ui `Sonner` |
| Cart state | Zustand (persisted to `localStorage`) |
| HTTP client | `fetch` (wrapped in TanStack Query) |

### 7.2 Page Routes

| Route | Component | Description |
|---|---|---|
| `/` | `ProductListingPage` | Hero, filters, search, product grid |
| `/products/[id]` | `ProductDetailPage` | Full product info, add to cart |
| `/cart` | `CartPage` | Cart items, order summary |
| `/checkout` | `CheckoutPage` | Forms, fake payment, place order |
| `/order-confirmation/[orderId]` | `OrderConfirmationPage` | Success state, order summary |

### 7.3 Shared Components

| Component | Purpose |
|---|---|
| `Header` | Logo, navigation links, cart icon with item count badge |
| `ProductCard` | Reusable card for grid and related-products sections |
| `StockBadge` | Renders "Low Stock" or "Out of Stock" badge |
| `QuantitySelector` | Increment/decrement with min/max guard |
| `CartSummary` | Subtotal / tax / shipping / total breakdown |
| `EmptyState` | Generic empty state with icon, message, and CTA |
| `LoadingSpinner` | Centered spinner for async page states |
| `ErrorBoundary` | Catch-all error display for failed fetches |

### 7.4 TanStack Query Keys

```
['products']                   — full product list
['products', id]               — single product
['products', { category, q }]  — filtered product list
['cart']                       — local cart (zustand, not fetched)
```

### 7.5 Cart State (Zustand)

```typescript
interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  availableInventory: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}
```

### 7.6 Environment Variables (Frontend)

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 7.7 Styling Conventions
- Use Tailwind utility classes exclusively; no custom CSS files except global `globals.css` for base resets.
- shadcn/ui components customised via `components.json` and Tailwind config only.
- Consistent spacing scale: `p-4`, `gap-4`, `m-6`, etc.
- Color tokens: primary = brand color defined in `tailwind.config.ts`; neutral grays for backgrounds.

---

## 8. Backend API Specification

### 8.1 Tech Stack
| Concern | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3 |
| Build tool | Maven |
| Database access | Spring Data JPA + Hibernate |
| Validation | Jakarta Bean Validation |
| JSON | Jackson |
| CORS | Spring MVC CORS config (allow `localhost:3000`) |

### 8.2 Base URL
```
http://localhost:8080/api
```

### 8.3 Standard Response Envelope

**Success:**
```json
{
  "data": { ... },
  "success": true
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_INVENTORY",
    "message": "Product 'Blue Sneakers' only has 2 units in stock.",
    "details": { "productId": 42, "requested": 5, "available": 2 }
  }
}
```

### 8.4 Endpoints

#### Products

**GET /products**
Returns the full product list, optionally filtered.

Query params:
| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category name (case-insensitive) |
| `q` | string | Full-text search on product name and description |

Response `200`:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Blue Sneakers",
      "description": "...",
      "price": 59.99,
      "category": "Footwear",
      "imageUrls": ["https://..."],
      "inventory": 12
    }
  ],
  "success": true
}
```

---

**GET /products/{id}**
Returns a single product by ID.

Response `200`: single product object (same shape as above).
Response `404`: product not found error.

---

**GET /products/categories**
Returns the distinct list of categories.

Response `200`:
```json
{ "data": ["Footwear", "Apparel", "Accessories"], "success": true }
```

---

#### Cart

Cart is managed client-side (Zustand + localStorage). The backend exposes a cart-validation endpoint used before checkout.

**POST /cart/validate**
Validates that requested quantities are available before the checkout form is submitted.

Request body:
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ]
}
```

Response `200` (all valid):
```json
{ "data": { "valid": true }, "success": true }
```

Response `200` (inventory issue):
```json
{
  "data": {
    "valid": false,
    "conflicts": [
      { "productId": 1, "requested": 2, "available": 1, "name": "Blue Sneakers" }
    ]
  },
  "success": true
}
```

---

#### Orders

**POST /orders**
Places an order. Backend re-validates inventory, decrements stock, and persists the order.

Request body:
```json
{
  "contact": {
    "email": "shopper@example.com",
    "phone": "555-0100"
  },
  "shipping": {
    "firstName": "Jane",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "addressLine2": "",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "US"
  },
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

Response `201`:
```json
{
  "data": {
    "orderId": "ORD-2024-00042",
    "placedAt": "2024-11-01T14:32:00Z",
    "items": [
      { "productId": 1, "name": "Blue Sneakers", "quantity": 2, "unitPrice": 59.99, "lineTotal": 119.98 }
    ],
    "subtotal": 119.98,
    "tax": 12.00,
    "shipping": 0.00,
    "total": 131.98
  },
  "success": true
}
```

Response `409` (inventory conflict): standard error envelope with code `INSUFFICIENT_INVENTORY`.
Response `400` (validation failure): standard error envelope with code `VALIDATION_ERROR`.

---

**GET /orders/{orderId}**
Returns a previously placed order. Used by the confirmation page.

Response `200`: order object (same shape as POST /orders response).
Response `404`: order not found.

---

### 8.5 Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `PRODUCT_NOT_FOUND` | 404 | Requested product ID does not exist |
| `ORDER_NOT_FOUND` | 404 | Requested order ID does not exist |
| `INSUFFICIENT_INVENTORY` | 409 | One or more items lack sufficient stock |
| `VALIDATION_ERROR` | 400 | Request body fails bean validation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 8.6 Service Layer Structure

```
ProductService
  - findAll(category, query)
  - findById(id)
  - findCategories()

CartService
  - validateCart(List<CartItemRequest>)

OrderService
  - placeOrder(OrderRequest)  // validates inventory, decrements stock, persists order
  - findById(orderId)
```

### 8.7 Environment Variables (Backend)

```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db
spring.datasource.username=root
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=validate
server.port=8080
```

---

## 9. Database Design Specification

### 9.1 Schema

#### `categories`
```sql
CREATE TABLE categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `products`
```sql
CREATE TABLE products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL,
  inventory   INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### `product_images`
```sql
CREATE TABLE product_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(30) NOT NULL UNIQUE,   -- e.g. ORD-2024-00042
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  shipping_name   VARCHAR(255) NOT NULL,
  address_line1   VARCHAR(255) NOT NULL,
  address_line2   VARCHAR(255),
  city            VARCHAR(100) NOT NULL,
  state           VARCHAR(100) NOT NULL,
  zip_code        VARCHAR(20) NOT NULL,
  country         CHAR(2) NOT NULL DEFAULT 'US',
  subtotal        DECIMAL(10, 2) NOT NULL,
  tax             DECIMAL(10, 2) NOT NULL,
  shipping        DECIMAL(10, 2) NOT NULL,
  total           DECIMAL(10, 2) NOT NULL,
  placed_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `order_items`
```sql
CREATE TABLE order_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  name        VARCHAR(255) NOT NULL,   -- snapshot at time of order
  unit_price  DECIMAL(10, 2) NOT NULL,
  quantity    INT UNSIGNED NOT NULL,
  line_total  DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_item_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 9.2 Indexes
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name     ON products(name);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### 9.3 Seed Data

```sql
-- Categories
INSERT INTO categories (name, slug) VALUES
  ('Footwear',    'footwear'),
  ('Apparel',     'apparel'),
  ('Accessories', 'accessories'),
  ('Electronics', 'electronics'),
  ('Home & Living', 'home-living');

-- Products (sample — expand to ~20 for demo)
INSERT INTO products (category_id, name, description, price, inventory) VALUES
  (1, 'Blue Running Sneakers',  'Lightweight trail runners with responsive cushioning.', 59.99, 12),
  (1, 'Classic White Canvas',   'Everyday low-top canvas shoes for any occasion.',       39.99,  3),  -- low stock
  (1, 'Black Formal Oxfords',   'Polished leather oxfords for the office.',               89.99,  0),  -- out of stock
  (2, 'Grey Crewneck Sweatshirt','Heavyweight fleece, relaxed fit.',                      44.99, 20),
  (2, 'Slim Fit Chinos',        'Stretch cotton chinos in khaki.',                        54.99,  8),
  (3, 'Leather Bifold Wallet',  'Full-grain leather, 6-card slots.',                      29.99, 15),
  (3, 'Canvas Tote Bag',        'Sturdy cotton tote with internal pocket.',               19.99,  4),  -- low stock
  (4, 'Wireless Earbuds',       'True wireless, 24-hour battery life.',                   79.99, 10),
  (4, 'USB-C Hub 7-in-1',       'HDMI, USB-A, SD card reader, and more.',                49.99,  6),
  (5, 'Ceramic Pour-Over Set',  'Minimalist dripper with matching carafe.',               34.99,  9);

-- Product images (using placeholder URLs for demo)
INSERT INTO product_images (product_id, url, sort_order) VALUES
  (1, 'https://placehold.co/600x600?text=Blue+Sneakers',    0),
  (1, 'https://placehold.co/600x600?text=Blue+Sneakers+2',  1),
  (2, 'https://placehold.co/600x600?text=White+Canvas',     0),
  (3, 'https://placehold.co/600x600?text=Black+Oxfords',    0),
  (4, 'https://placehold.co/600x600?text=Sweatshirt',       0),
  (5, 'https://placehold.co/600x600?text=Chinos',           0),
  (6, 'https://placehold.co/600x600?text=Wallet',           0),
  (7, 'https://placehold.co/600x600?text=Tote+Bag',         0),
  (8, 'https://placehold.co/600x600?text=Earbuds',          0),
  (9, 'https://placehold.co/600x600?text=USB+Hub',          0),
  (10,'https://placehold.co/600x600?text=Pour+Over',        0);
```

---

## 10. Validation and Business Rules

| Rule | Location | Detail |
|---|---|---|
| Quantity minimum | Frontend + Backend | `quantity >= 1` always |
| Quantity maximum (add to cart) | Frontend | `quantity <= product.inventory` |
| Inventory check on order | Backend | Re-validate each item at `POST /orders` time; reject with `409` if any item has insufficient stock |
| Inventory decrement | Backend | Decrement `products.inventory` atomically within a DB transaction after order validation succeeds |
| Price calculation | Backend | Subtotal = sum of `(unit_price × quantity)` per line; tax = `subtotal × 0.10`; shipping = `subtotal > 75 ? 0 : 4.99` |
| Card number format | Frontend only | 16-digit numeric, displayed with spaces; never sent to backend |
| Expiry date | Frontend only | Must be a future month/year; never sent to backend |
| Required checkout fields | Frontend + Backend | First name, last name, address line 1, city, state, zip, country, email |
| Order number format | Backend | `ORD-{YYYY}-{5-digit-zero-padded-sequence}`, generated server-side |

---

## 11. Error Handling

### Frontend
- **Network error / 5xx**: Show a full-page `ErrorBoundary` with a "Something went wrong" message and a retry button.
- **404 product**: Redirect to `/` with a toast notification.
- **409 inventory conflict on checkout**: Highlight the conflicting cart items in red, show an inline message, and disable **Place Order** until the cart is corrected.
- **400 validation errors from API**: Map field errors to the relevant form fields via React Hook Form's `setError`.
- **Empty search results**: Show an inline "No products found" state within the grid area, not a full-page error.

### Backend
- All exceptions mapped to the standard error envelope via a `@RestControllerAdvice` global exception handler.
- `EntityNotFoundException` → `404 PRODUCT_NOT_FOUND` or `ORDER_NOT_FOUND`.
- `InsufficientInventoryException` → `409 INSUFFICIENT_INVENTORY` with per-item conflict details.
- `MethodArgumentNotValidException` → `400 VALIDATION_ERROR` with per-field messages.
- All other `Exception` → `500 INTERNAL_ERROR` (stack trace logged, not exposed to client).

---

## 12. Build and Deployment Notes

### Prerequisites
| Tool | Version |
|---|---|
| Node.js | 20+ |
| Java JDK | 17+ |
| Maven | 3.9+ |
| MySQL | 8.0+ |

### Step 1 — Database Setup
```bash
mysql -u root -p -e "CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p ecommerce_db < database/schema.sql
mysql -u root -p ecommerce_db < database/seed.sql
```

### Step 2 — Backend
```bash
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties with your DB credentials
mvn spring-boot:run
# API available at http://localhost:8080
```

### Step 3 — Frontend
```bash
cd frontend
cp .env.example .env.local
# .env.local: NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev
# App available at http://localhost:3000
```

### Environment Variable Reference

**`frontend/.env.example`**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**`backend/src/main/resources/application.properties.example`**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
server.port=8080
```

---

## 13. Test Plan

### 13.1 Frontend Tests (Jest + React Testing Library)

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
| FE-13 | Cart | Free shipping threshold: subtotal > $75 shows $0 shipping | Shipping line shows "$0.00" |
| FE-14 | Cart | Empty cart state shown when all items removed | Empty state component rendered |
| FE-15 | Checkout | Required field validation on submit | Errors shown on blank required fields |
| FE-16 | Checkout | Invalid card number format rejected | Inline error on card number field |
| FE-17 | Checkout | Past expiry date rejected | Inline error on expiry field |
| FE-18 | Order Confirmation | Estimated delivery date is 5 business days from today | Correct date displayed |
| FE-19 | Cart State | Cart persists after page refresh (localStorage) | Items still in cart on reload |

### 13.2 Backend Tests (JUnit 5 + Mockito + Spring Boot Test)

| ID | Area | Test Case | Expected Result |
|---|---|---|---|
| BE-01 | Product API | GET /products returns all products | 200 with list |
| BE-02 | Product API | GET /products?category=Footwear filters correctly | Only footwear products returned |
| BE-03 | Product API | GET /products?q=sneakers filters by name | Only matching products returned |
| BE-04 | Product API | GET /products/{id} returns correct product | 200 with product data |
| BE-05 | Product API | GET /products/{id} for non-existent ID | 404 PRODUCT_NOT_FOUND |
| BE-06 | Product API | GET /products/categories returns category list | 200 with distinct category names |
| BE-07 | Cart Validate | POST /cart/validate with valid quantities | 200 `valid: true` |
| BE-08 | Cart Validate | POST /cart/validate with over-stock quantity | 200 `valid: false` with conflict details |
| BE-09 | Order | POST /orders with valid data and sufficient stock | 201 with order ID, inventory decremented |
| BE-10 | Order | POST /orders with insufficient stock | 409 INSUFFICIENT_INVENTORY |
| BE-11 | Order | POST /orders with missing required field | 400 VALIDATION_ERROR |
| BE-12 | Order | GET /orders/{orderId} returns correct order | 200 with order data |
| BE-13 | Order | GET /orders/{orderId} for non-existent ID | 404 ORDER_NOT_FOUND |
| BE-14 | Order Service | Inventory decrement is atomic within transaction | Concurrent test: no oversell |
| BE-15 | Price Calc | Subtotal > $75 computes $0 shipping | Shipping = 0 in response |
| BE-16 | Price Calc | Subtotal ≤ $75 computes $4.99 shipping | Shipping = 4.99 in response |
| BE-17 | Price Calc | Tax calculated as 10% of subtotal | Tax = subtotal × 0.10 |

### 13.3 Integration / End-to-End (Playwright — stretch goal)

| ID | Flow | Steps | Expected Result |
|---|---|---|---|
| E2E-01 | Happy path | Browse → add to cart → checkout → confirm | Order confirmation page with order number |
| E2E-02 | Out-of-stock guard | Add max inventory → try to add 1 more → checkout | Increment button disabled on detail page |
| E2E-03 | Empty cart guard | Navigate to /cart with no items | Empty state shown, proceed to checkout disabled |
| E2E-04 | Form validation | Submit checkout with blank fields | All required-field errors shown |

---

## 14. Suggested Folder Structure

```
ai-hackathon-arrive/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # → ProductListingPage
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx                # → ProductDetailPage
│   │   ├── cart/
│   │   │   └── page.tsx                    # → CartPage
│   │   ├── checkout/
│   │   │   └── page.tsx                    # → CheckoutPage
│   │   └── order-confirmation/
│   │       └── [orderId]/
│   │           └── page.tsx                # → OrderConfirmationPage
│   ├── components/
│   │   ├── ui/                             # shadcn/ui generated components
│   │   ├── layout/
│   │   │   └── Header.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── HeroBanner.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── checkout/
│   │   │   ├── ShippingForm.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── PaymentForm.tsx
│   │   └── shared/
│   │       ├── StockBadge.tsx
│   │       ├── QuantitySelector.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   └── useOrder.ts
│   ├── lib/
│   │   ├── api.ts                          # fetch wrapper
│   │   └── utils.ts
│   ├── store/
│   │   └── cartStore.ts                    # Zustand cart store
│   ├── types/
│   │   └── index.ts                        # shared TypeScript types
│   ├── .env.example
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/
│   └── src/
│       ├── main/
│       │   ├── java/com/hackathon/ecommerce/
│       │   │   ├── EcommerceApplication.java
│       │   │   ├── config/
│       │   │   │   └── CorsConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── ProductController.java
│       │   │   │   ├── CartController.java
│       │   │   │   └── OrderController.java
│       │   │   ├── service/
│       │   │   │   ├── ProductService.java
│       │   │   │   ├── CartService.java
│       │   │   │   └── OrderService.java
│       │   │   ├── repository/
│       │   │   │   ├── ProductRepository.java
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   └── OrderRepository.java
│       │   │   ├── model/
│       │   │   │   ├── Product.java
│       │   │   │   ├── Category.java
│       │   │   │   ├── ProductImage.java
│       │   │   │   ├── Order.java
│       │   │   │   └── OrderItem.java
│       │   │   ├── dto/
│       │   │   │   ├── ProductDTO.java
│       │   │   │   ├── OrderRequest.java
│       │   │   │   ├── OrderResponse.java
│       │   │   │   ├── CartValidateRequest.java
│       │   │   │   └── CartValidateResponse.java
│       │   │   └── exception/
│       │   │       ├── GlobalExceptionHandler.java
│       │   │       ├── InsufficientInventoryException.java
│       │   │       └── EntityNotFoundException.java
│       │   └── resources/
│       │       ├── application.properties
│       │       └── application.properties.example
│       └── test/
│           └── java/com/hackathon/ecommerce/
│               ├── controller/
│               └── service/
│   └── pom.xml
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
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
- [ ] `GET /products`, `GET /products/{id}`, `GET /products/categories`
- [ ] `POST /cart/validate`
- [ ] `POST /orders` with inventory check and decrement
- [ ] `GET /orders/{orderId}`
- [ ] MySQL schema + seed data (≥ 10 products across ≥ 3 categories)
- [ ] CORS configured for localhost:3000

### Should Have (Demo Polish)
- [ ] Hero banner on listing page
- [ ] Related products section on detail page
- [ ] Low Stock / Out of Stock badges
- [ ] Toast notifications on cart actions
- [ ] Free shipping threshold messaging
- [ ] Responsive layout on mobile viewport

### Nice to Have (If Time Permits)
- [ ] Playwright E2E happy-path test
- [ ] Animated cart drawer instead of separate cart page
- [ ] Skeleton loading states on product grid
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
| Containerisation | Provide a `docker-compose.yml` to spin up frontend, backend, and MySQL together |
| Mobile App | React Native app sharing the same backend API |

---

*Document version: 1.0 — prepared for AI Hackathon, April 2026.*
