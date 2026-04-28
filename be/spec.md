# BuyMore — Backend Spec (REST API)

> This document is intended for the backend developer. It defines the database schema and all REST endpoints the frontend expects. Build these endpoints and the frontend will connect automatically by setting `NEXT_PUBLIC_API_URL`.

---

## Database tables

### `products`

| Column      | Type          | Constraints                     | Notes                       |
| ----------- | ------------- | ------------------------------- | --------------------------- |
| id          | UUID          | PK, default gen_random_uuid()   |                             |
| name        | VARCHAR(255)  | NOT NULL                        |                             |
| description | TEXT          | NOT NULL                        |                             |
| price       | DECIMAL(10,2) | NOT NULL, CHECK > 0             | USD                         |
| category    | VARCHAR(100)  | NOT NULL                        | e.g. "Footwear", "Clothing" |
| images      | TEXT[]        | NOT NULL, min 1 item            | Array of image URLs         |
| inventory   | INTEGER       | NOT NULL, default 0, CHECK >= 0 |                             |
| rating      | DECIMAL(2,1)  | nullable, CHECK 1–5             |                             |
| tags        | TEXT[]        | nullable                        | e.g. ["new", "sale"]        |
| is_featured | BOOLEAN       | NOT NULL, default false         |                             |
| created_at  | TIMESTAMPTZ   | NOT NULL, default now()         |                             |
| updated_at  | TIMESTAMPTZ   | NOT NULL, default now()         |                             |

Indexes: `category`, `is_featured`, `inventory` (for low-stock queries)

---

### `carts`

| Column     | Type         | Constraints             | Notes                                        |
| ---------- | ------------ | ----------------------- | -------------------------------------------- |
| id         | UUID         | PK                      |                                              |
| session_id | VARCHAR(255) | UNIQUE, NOT NULL        | Client-generated UUID stored in localStorage |
| created_at | TIMESTAMPTZ  | NOT NULL, default now() |                                              |
| updated_at | TIMESTAMPTZ  | NOT NULL, default now() |                                              |

---

### `cart_items`

| Column     | Type        | Constraints                     | Notes |
| ---------- | ----------- | ------------------------------- | ----- |
| id         | UUID        | PK                              |       |
| cart_id    | UUID        | FK → carts.id ON DELETE CASCADE |       |
| product_id | UUID        | FK → products.id                |       |
| quantity   | INTEGER     | NOT NULL, CHECK > 0             |       |
| created_at | TIMESTAMPTZ | NOT NULL, default now()         |       |
| updated_at | TIMESTAMPTZ | NOT NULL, default now()         |       |

Unique constraint: `(cart_id, product_id)`

---

### `orders`

| Column             | Type          | Constraints                 | Notes                                              |
| ------------------ | ------------- | --------------------------- | -------------------------------------------------- |
| id                 | UUID          | PK                          |                                                    |
| order_number       | VARCHAR(20)   | UNIQUE, NOT NULL            | e.g. "BM-2024-00042"                               |
| status             | VARCHAR(50)   | NOT NULL, default 'pending' | pending, processing, shipped, delivered, cancelled |
| subtotal           | DECIMAL(10,2) | NOT NULL                    |                                                    |
| taxes              | DECIMAL(10,2) | NOT NULL                    |                                                    |
| shipping           | DECIMAL(10,2) | NOT NULL                    |                                                    |
| total              | DECIMAL(10,2) | NOT NULL                    |                                                    |
| customer_name      | VARCHAR(255)  | NOT NULL                    |                                                    |
| email              | VARCHAR(255)  | NOT NULL                    |                                                    |
| phone              | VARCHAR(50)   | nullable                    |                                                    |
| estimated_delivery | DATE          | NOT NULL                    |                                                    |
| created_at         | TIMESTAMPTZ   | NOT NULL, default now()     |                                                    |

---

### `order_items`

| Column        | Type          | Constraints                      | Notes                     |
| ------------- | ------------- | -------------------------------- | ------------------------- |
| id            | UUID          | PK                               |                           |
| order_id      | UUID          | FK → orders.id ON DELETE CASCADE |                           |
| product_id    | UUID          | FK → products.id                 |                           |
| product_name  | VARCHAR(255)  | NOT NULL                         | Snapshot at time of order |
| product_image | TEXT          | NOT NULL                         | First image URL snapshot  |
| price         | DECIMAL(10,2) | NOT NULL                         | Price at time of order    |
| quantity      | INTEGER       | NOT NULL, CHECK > 0              |                           |

---

### `shipping_addresses`

| Column     | Type         | Constraints                              | Notes |
| ---------- | ------------ | ---------------------------------------- | ----- |
| id         | UUID         | PK                                       |       |
| order_id   | UUID         | FK → orders.id ON DELETE CASCADE, UNIQUE |       |
| first_name | VARCHAR(100) | NOT NULL                                 |       |
| last_name  | VARCHAR(100) | NOT NULL                                 |       |
| address    | VARCHAR(255) | NOT NULL                                 |       |
| city       | VARCHAR(100) | NOT NULL                                 |       |
| state      | VARCHAR(100) | NOT NULL                                 |       |
| zip        | VARCHAR(20)  | NOT NULL                                 |       |
| country    | VARCHAR(100) | NOT NULL                                 |       |

---

## REST API endpoints

### Base URL

```
https://api.buymore.com/v1
```

All responses are JSON. Errors follow this shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

---

### Products

#### `GET /products`

Returns a paginated, filterable list of products.

**Query params:**
| Param | Type | Default | Notes |
|---|---|---|---|
| page | integer | 1 | |
| limit | integer | 20 | max 100 |
| category | string | — | Filter by category |
| search | string | — | Full-text search on name + description |
| is_featured | boolean | — | |
| sort | string | created_at_desc | Options: price_asc, price_desc, name_asc, rating_desc |

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "WMX Rubber Zebra Sandal",
      "description": "...",
      "price": 36.0,
      "category": "Footwear",
      "images": ["https://..."],
      "inventory": 12,
      "rating": 4.5,
      "tags": ["new"],
      "isFeatured": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "totalPages": 5
  }
}
```

---

#### `GET /products/:id`

Returns a single product.

**Response 200:** Single product object (same shape as above)
**Response 404:** `{ "error": "Product not found", "code": "PRODUCT_NOT_FOUND" }`

---

#### `GET /products/:id/related`

Returns up to 4 related products in the same category.

**Response 200:**

```json
{
  "data": [ ...product objects... ]
}
```

---

#### `GET /products/categories`

Returns all available categories with product counts.

**Response 200:**

```json
{
  "data": [
    { "name": "Footwear", "count": 24 },
    { "name": "Clothing", "count": 31 }
  ]
}
```

---

### Cart

The cart is session-based. The client sends a `X-Session-ID` header (UUID stored in localStorage). The backend creates the cart on first request if it doesn't exist.

#### `GET /cart`

Returns the current cart with full product details.

**Headers:** `X-Session-ID: <uuid>`

**Response 200:**

```json
{
  "id": "uuid",
  "items": [
    {
      "productId": "uuid",
      "product": { ...full product object... },
      "quantity": 2
    }
  ],
  "subtotal": 72.00,
  "taxes": 5.76,
  "shipping": 0.00,
  "total": 77.76
}
```

**Notes:**

- `taxes` = subtotal × 0.08
- `shipping` = 0 if subtotal >= 100, else 9.99
- `total` = subtotal + taxes + shipping

---

#### `POST /cart/items`

Adds an item to the cart or increments quantity if already present.

**Headers:** `X-Session-ID: <uuid>`

**Body:**

```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Validation:**

- Product must exist
- `quantity` must be >= 1
- `currentQty + quantity` must not exceed `product.inventory`

**Response 200:** Updated cart object
**Response 400:** `{ "error": "Only 3 items left in stock", "code": "INSUFFICIENT_INVENTORY" }`

---

#### `PATCH /cart/items/:productId`

Updates the quantity of a specific cart item.

**Headers:** `X-Session-ID: <uuid>`

**Body:**

```json
{
  "quantity": 3
}
```

**Validation:** Same inventory check as above.

**Response 200:** Updated cart object
**Response 404:** `{ "error": "Item not in cart", "code": "CART_ITEM_NOT_FOUND" }`

---

#### `DELETE /cart/items/:productId`

Removes a specific item from the cart.

**Headers:** `X-Session-ID: <uuid>`

**Response 200:** Updated cart object

---

#### `DELETE /cart`

Clears all items from the cart.

**Headers:** `X-Session-ID: <uuid>`

**Response 200:** `{ "message": "Cart cleared" }`

---

### Orders

#### `POST /orders`

Places an order. This should:

1. Validate all required fields
2. Re-validate inventory for each item (race condition protection)
3. Decrement `products.inventory` for each item
4. Clear the cart
5. Create the order with a human-readable `order_number`
6. Return the full order

**Headers:** `X-Session-ID: <uuid>`

**Body:**

```json
{
  "shipping": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+1 555 000 1234",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "payment": {
    "cardNumber": "4111111111111111",
    "cardExpiry": "12/26",
    "cardCvc": "123"
  }
}
```

> Note: No real payment processing needed. Accept any card details and return success.

**Response 201:**

```json
{
  "id": "uuid",
  "orderNumber": "BM-2024-00042",
  "status": "processing",
  "items": [
    {
      "productId": "uuid",
      "productName": "WMX Rubber Zebra Sandal",
      "productImage": "https://...",
      "price": 36.0,
      "quantity": 2
    }
  ],
  "subtotal": 72.0,
  "taxes": 5.76,
  "shipping": 0.0,
  "total": 77.76,
  "customerName": "Jane Doe",
  "email": "jane@example.com",
  "estimatedDelivery": "2024-12-20",
  "createdAt": "2024-12-15T14:32:00Z"
}
```

**Response 400:** Validation error
**Response 409:** `{ "error": "Only 1 item left in stock for WMX Rubber Zebra Sandal", "code": "INSUFFICIENT_INVENTORY" }`

---

#### `GET /orders/:id`

Returns a single order.

**Response 200:** Order object (same shape as POST /orders response)
**Response 404:** `{ "error": "Order not found", "code": "ORDER_NOT_FOUND" }`

---

## CORS

Allow:

- `http://localhost:3000` (dev)
- Your production Vercel URL

Headers: `Content-Type`, `X-Session-ID`

---

## Seed data

Please seed at least 12 products across these categories so the frontend has data to display:

- Footwear (4+ products)
- Clothing (4+ products)
- Accessories (2+ products)
- Bags (2+ products)

Include variety in inventory: some with 0 (out of stock), some with 1–4 (low stock), most with 10–50.

---

## Order number generation

```
BM-{YEAR}-{5-digit-zero-padded-sequence}
e.g. BM-2024-00001, BM-2024-00042
```

Use a sequence per year or a global auto-increment mapped to this format.

---

## Estimated delivery calculation

`estimated_delivery = order date + random(3, 5) business days`
Exclude weekends. Return as ISO date string `YYYY-MM-DD`.
