# BuyMore API Contract

> **Base URL:** `http://localhost:8080/v1`  
> **Format:** JSON (Content-Type: `application/json`)  
> **CORS:** Allowed origins — `http://localhost:3000`, `https://*.vercel.app`  
> **Allowed headers:** `Content-Type`, `X-Session-ID`

---

## Session Identity

Cart and order endpoints require the `X-Session-ID` header. The frontend generates a UUID v4 on first load, persists it in `localStorage`, and sends it with every cart/order request. A cart is auto-created on the backend on the first request for a new session ID.

```
X-Session-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## Error Format

All error responses share the same envelope:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_CODE"
}
```

### Error Codes

| Code | HTTP | Trigger |
|---|---|---|
| `PRODUCT_NOT_FOUND` | 404 | Product UUID does not exist |
| `CART_ITEM_NOT_FOUND` | 404 | Item not present in cart |
| `ORDER_NOT_FOUND` | 404 | Order UUID does not exist |
| `INSUFFICIENT_INVENTORY` | 400 | Cart add/update exceeds available stock |
| `INSUFFICIENT_INVENTORY` | 409 | Order placement — stock depleted between cart and checkout |
| `VALIDATION_ERROR` | 400 | Bean Validation failure on request body |
| `BAD_REQUEST` | 400 | e.g. attempting checkout with an empty cart |
| `INTERNAL_ERROR` | 500 | Unhandled server exception |

---

## Products

### GET `/v1/products`

Returns a paginated, filterable list of products.

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | 1-based page number |
| `limit` | integer | `20` | Items per page (max `100`) |
| `category` | string | — | Exact category name, case-insensitive match |
| `search` | string | — | Full-text filter on `name` and `description` |
| `is_featured` | boolean | — | When `true`, returns only featured products |
| `sort` | string | `created_at_desc` | Sort order — see values below |

**`sort` values:**

| Value | Sorts by |
|---|---|
| `created_at_desc` | Newest first (default) |
| `price_asc` | Cheapest first |
| `price_desc` | Most expensive first |
| `name_asc` | A → Z |
| `rating_desc` | Highest rated first |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Urban Runner Pro Sneakers",
      "description": "High-performance running sneakers with cushioned soles...",
      "price": 89.99,
      "category": "Footwear",
      "images": [
        "https://picsum.photos/seed/sneaker1/400/400",
        "https://picsum.photos/seed/sneaker1b/400/400"
      ],
      "inventory": 25,
      "rating": 4.8,
      "tags": ["bestseller"],
      "isFeatured": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 16,
    "totalPages": 1
  }
}
```

**Notes:**
- `rating` is nullable — omitted from response if `null`.
- `tags` is nullable — omitted from response if `null`.
- `isFeatured` defaults to `false`.

---

### GET `/v1/products/categories`

Returns all distinct categories with their product counts.

> Must be declared before `GET /v1/products/{id}` — Spring matches the literal path `categories` first.

**Response `200`:**

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

### GET `/v1/products/{id}`

Returns a single product.

**Path parameter:** `id` — UUID

**Response `200`:** single product object (same shape as items in the list response)

**Response `404`:**
```json
{ "error": "Product not found", "code": "PRODUCT_NOT_FOUND" }
```

---

### GET `/v1/products/{id}/related`

Returns up to 4 products in the same category as `{id}`, excluding `{id}` itself.

**Path parameter:** `id` — UUID

**Response `200`:**

```json
{
  "data": [
    { /* ProductResponse */ },
    { /* ProductResponse */ }
  ]
}
```

**Response `404`:** same as `GET /v1/products/{id}`

---

## Cart

All cart endpoints require `X-Session-ID` header. A cart is created automatically on first use.

---

### GET `/v1/cart`

Returns the current cart state with computed totals.

**Headers:** `X-Session-ID: <uuid>`

**Response `200`:**

```json
{
  "id": "cart-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "product": { /* full ProductResponse object */ },
      "quantity": 2
    }
  ],
  "subtotal": 179.98,
  "taxes": 14.40,
  "shipping": 0.00,
  "total": 194.38
}
```

**Pricing rules:**
- `taxes` = `subtotal × 0.08` (8%), rounded to 2 decimal places
- `shipping` = `$0.00` if `subtotal >= $100.00`, else `$9.99`
- `total` = `subtotal + taxes + shipping`

**Empty cart:** returns the same shape with `items: []` and all money fields as `0.00`.

---

### POST `/v1/cart/items`

Adds a product to the cart. If the product is already in the cart, quantity is incremented.

**Headers:** `X-Session-ID: <uuid>`

**Request body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 1
}
```

**Validation:**
- `productId` — required, UUID
- `quantity` — required, minimum `1`

**Response `200`:** updated `CartResponse` (same shape as GET `/v1/cart`)

**Response `400` — inventory exceeded:**
```json
{
  "error": "Only 3 items left in stock",
  "code": "INSUFFICIENT_INVENTORY"
}
```

**Response `400` — validation failure:**
```json
{
  "error": "productId is required; quantity must be at least 1",
  "code": "VALIDATION_ERROR"
}
```

---

### PATCH `/v1/cart/items/{productId}`

Sets the quantity for a cart item to an absolute value (replaces current quantity).

**Headers:** `X-Session-ID: <uuid>`

**Path parameter:** `productId` — UUID

**Request body:**
```json
{
  "quantity": 3
}
```

**Validation:**
- `quantity` — required, minimum `1`

**Response `200`:** updated `CartResponse`

**Response `400` — inventory exceeded:** same as POST `/v1/cart/items`

**Response `404` — item not in cart:**
```json
{ "error": "Item not in cart", "code": "CART_ITEM_NOT_FOUND" }
```

---

### DELETE `/v1/cart/items/{productId}`

Removes a single item from the cart.

**Headers:** `X-Session-ID: <uuid>`

**Path parameter:** `productId` — UUID

**Response `200`:** updated `CartResponse` (item removed)

**Response `404`:**
```json
{ "error": "Item not in cart", "code": "CART_ITEM_NOT_FOUND" }
```

---

### DELETE `/v1/cart`

Clears all items from the cart.

**Headers:** `X-Session-ID: <uuid>`

**Response `200`:**
```json
{ "message": "Cart cleared" }
```

---

## Orders

### POST `/v1/orders`

Places an order using the current cart. The backend:

1. Fetches the cart by session ID.
2. Validates each item against current inventory (re-check for race conditions).
3. Decrements inventory for each product atomically within a `@Transactional` block.
4. Persists the order with a snapshot of product names, images, and prices.
5. Clears the cart.
6. Returns the created order.

**Headers:** `X-Session-ID: <uuid>`

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
    "cardExpiry": "12/27",
    "cardCvc": "123"
  }
}
```

**Validation — `shipping`:**

| Field | Required | Rule |
|---|---|---|
| `firstName` | Yes | Not blank |
| `lastName` | Yes | Not blank |
| `email` | Yes | Valid email format |
| `phone` | No | — |
| `address` | Yes | Not blank |
| `city` | Yes | Not blank |
| `state` | Yes | Not blank |
| `zip` | Yes | Not blank |
| `country` | Yes | Not blank |

**Validation — `payment`:**

| Field | Required | Rule |
|---|---|---|
| `cardNumber` | Yes | Not blank (no real processing) |
| `cardExpiry` | Yes | Not blank |
| `cardCvc` | Yes | Not blank |

> Payment fields are stored nowhere and validated only for presence. No real payment processing occurs.

**Response `201`:**

```json
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
  "phone": "555-0100",
  "estimatedDelivery": "2026-05-05",
  "createdAt": "2026-04-28T14:32:00Z"
}
```

**Order number format:** `BM-{YEAR}-{5-digit zero-padded sequence}` — sequence resets each calendar year.

**Estimated delivery:** order date + 3–5 business days (weekends skipped, randomly chosen within range).

**Response `409` — inventory conflict (detected at order time):**
```json
{
  "error": "Only 1 item left in stock for Urban Runner Pro Sneakers",
  "code": "INSUFFICIENT_INVENTORY"
}
```

**Response `400` — empty cart:**
```json
{ "error": "Cart is empty", "code": "BAD_REQUEST" }
```

**Response `400` — validation failure:**
```json
{
  "error": "firstName is required; email must be valid",
  "code": "VALIDATION_ERROR"
}
```

---

### GET `/v1/orders/{id}`

Retrieves an order by its UUID. Used by the order confirmation page.

**Path parameter:** `id` — UUID (the `id` field, not `orderNumber`)

**Response `200`:** `OrderResponse` (same shape as `POST /v1/orders` response)

**Response `404`:**
```json
{ "error": "Order not found", "code": "ORDER_NOT_FOUND" }
```

---

## Seed Data Summary

`DataSeeder` runs on startup (skipped if any products already exist) and seeds **16 products**:

| Category | Count | Stock notes |
|---|---|---|
| Footwear | 5 | 1 out-of-stock (inventory = 0), 1 low-stock (inventory = 3) |
| Clothing | 5 | 1 low-stock (inventory = 2), rest 15–50 |
| Accessories | 3 | 1 low-stock (inventory = 1) |
| Bags | 3 | 1 out-of-stock (inventory = 0) |

Low-stock threshold for UI badge: `inventory <= 5 && inventory > 0`
Out-of-stock threshold: `inventory == 0`

---

## Local Development

```bash
# Start backend (H2 in-memory — no DB setup needed)
cd be
mvn spring-boot:run
# → http://localhost:8080/v1
# → H2 console: http://localhost:8080/h2-console

# Start frontend
cd fe/e-commerce
npm run dev
# → http://localhost:3000
```

**Frontend environment variable:**
```env
# fe/e-commerce/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
```

Leave `NEXT_PUBLIC_API_URL` unset to use the built-in mock API layer.
