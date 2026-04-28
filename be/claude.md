# BuyMore — Backend (Java / Spring Boot)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Web | Spring Web MVC (embedded Tomcat) |
| Persistence | Spring Data JPA + Hibernate 6 |
| Database | H2 in-memory (default) · PostgreSQL (optional) |
| Validation | Jakarta Bean Validation (Hibernate Validator) |
| Build | Maven 3.6+ |
| Utilities | Lombok, Jackson |

## Running the Application

```bash
cd be
mvn spring-boot:run
# API available at http://localhost:8080/v1
# H2 console at  http://localhost:8080/h2-console
```

Build a runnable JAR:

```bash
mvn package -DskipTests
java -jar target/buymore-api-0.0.1-SNAPSHOT.jar
```

Switch to PostgreSQL by overriding these properties (env vars or `application.properties`):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/buymore
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=<user>
spring.datasource.password=<pass>
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

## Project Structure

```
be/
├── pom.xml
└── src/main/
    ├── resources/
    │   └── application.properties
    └── java/com/buymore/
        ├── BuyMoreApplication.java       # @SpringBootApplication entry point
        ├── DataSeeder.java               # Seeds 16 products on first startup
        ├── config/
        │   └── CorsConfig.java           # CORS: localhost:3000 + *.vercel.app
        ├── converter/
        │   └── StringListConverter.java  # Serialises List<String> ↔ JSON TEXT column
        ├── entity/
        │   ├── Product.java
        │   ├── Cart.java
        │   ├── CartItem.java
        │   ├── CustomerOrder.java        # Named CustomerOrder to avoid SQL keyword clash
        │   ├── OrderItem.java
        │   └── ShippingAddress.java
        ├── repository/
        │   ├── ProductRepository.java    # Custom JPQL filters + category counts
        │   ├── CartRepository.java
        │   ├── CartItemRepository.java
        │   ├── OrderRepository.java
        │   └── OrderItemRepository.java
        ├── dto/
        │   ├── ProductResponse.java
        │   ├── ProductListResponse.java  # Includes Meta (page, limit, total, totalPages)
        │   ├── CartResponse.java         # Includes CartItemResponse inner class
        │   ├── CartItemRequest.java
        │   ├── UpdateCartItemRequest.java
        │   ├── OrderRequest.java         # Includes ShippingInfo + PaymentInfo inner classes
        │   ├── OrderResponse.java        # Includes OrderItemResponse inner class
        │   ├── CategoryResponse.java
        │   └── ErrorResponse.java        # { "error": "...", "code": "..." }
        ├── exception/
        │   ├── ResourceNotFoundException.java
        │   ├── InsufficientInventoryException.java
        │   └── GlobalExceptionHandler.java  # @RestControllerAdvice
        ├── service/
        │   ├── ProductService.java
        │   ├── CartService.java
        │   └── OrderService.java
        └── controller/
            ├── ProductController.java
            ├── CartController.java
            └── OrderController.java
```

## Database Schema

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| name | VARCHAR(255) | |
| description | TEXT | |
| price | DECIMAL(10,2) | |
| category | VARCHAR(100) | Footwear / Clothing / Accessories / Bags |
| images | TEXT | JSON array stored as string |
| inventory | INTEGER | Default 0 |
| rating | DECIMAL(2,1) | Nullable, 1–5 |
| tags | TEXT | JSON array stored as string, nullable |
| is_featured | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `carts`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | VARCHAR(255) UNIQUE | Client-supplied UUID from localStorage |
| created_at / updated_at | TIMESTAMPTZ | |

### `cart_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| cart_id | UUID FK → carts | |
| product_id | UUID FK → products | |
| quantity | INTEGER | |
| Unique | (cart_id, product_id) | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| order_number | VARCHAR(20) UNIQUE | Format: BM-YYYY-00042 |
| status | VARCHAR(50) | pending / processing / shipped / delivered / cancelled |
| subtotal / taxes / shipping / total | DECIMAL(10,2) | |
| customer_name, email, phone | VARCHAR | |
| estimated_delivery | DATE | Order date + 3–5 business days |
| created_at | TIMESTAMPTZ | |

### `order_items`
Snapshot of product name, image, price at time of order.

### `shipping_addresses`
One-to-one with orders (first_name, last_name, address, city, state, zip, country).

## REST Endpoints

Base path: `/v1`  
All errors return `{ "error": "...", "code": "MACHINE_CODE" }`.

### Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | Paginated list. Query params: `page`, `limit` (max 100), `category`, `search`, `is_featured`, `sort` (`price_asc`, `price_desc`, `name_asc`, `rating_desc`, `created_at_desc`) |
| GET | `/products/categories` | All categories with product counts |
| GET | `/products/:id` | Single product. 404 → `PRODUCT_NOT_FOUND` |
| GET | `/products/:id/related` | Up to 4 products in same category |

### Cart

All cart endpoints require the `X-Session-ID` header (UUID). A cart is auto-created on first request.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Current cart with totals |
| POST | `/cart/items` | Add item `{ productId, quantity }`. Checks inventory. |
| PATCH | `/cart/items/:productId` | Update quantity `{ quantity }`. Checks inventory. |
| DELETE | `/cart/items/:productId` | Remove one item |
| DELETE | `/cart` | Clear all items |

**Pricing rules:**
- `taxes` = subtotal × 0.08
- `shipping` = $0.00 if subtotal ≥ $100, else $9.99
- `total` = subtotal + taxes + shipping

### Orders

| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Place order (requires `X-Session-ID`). Validates inventory, decrements stock, clears cart, returns 201. |
| GET | `/orders/:id` | Retrieve a single order |

**POST /orders body:**
```json
{
  "shipping": { "firstName", "lastName", "email", "phone", "address", "city", "state", "zip", "country" },
  "payment":  { "cardNumber", "cardExpiry", "cardCvc" }
}
```
> Payment is accepted as-is — no real processing.

## Key Business Logic

### Order Number Generation
Format `BM-{YEAR}-{5-digit-sequence}` e.g. `BM-2026-00001`.  
Counts existing orders for the current calendar year and increments. Lives in `OrderService.generateOrderNumber()`.

### Estimated Delivery
Order date + random 3–5 **business days** (weekends skipped). Lives in `OrderService.calculateEstimatedDelivery()`.

### Inventory Protection
`POST /orders` re-checks inventory inside a `@Transactional` block after cart fetch to guard against race conditions. Returns HTTP 409 `INSUFFICIENT_INVENTORY` if stock is insufficient.

### Array Columns
`images` and `tags` on `Product` are stored as JSON strings in a `TEXT` column via `StringListConverter` — avoids PostgreSQL-specific `TEXT[]` while keeping the entity API clean (`List<String>`).

## Seed Data

`DataSeeder` runs at startup (skips if products already exist) and creates **16 products** across 4 categories:

| Category | Count | Inventory variety |
|----------|-------|-------------------|
| Footwear | 5 | includes 1 out-of-stock |
| Clothing | 5 | mix of low / normal stock |
| Accessories | 3 | includes 1 low-stock (1 item) |
| Bags | 3 | includes 1 out-of-stock |

## CORS

Allowed origins: `http://localhost:3000` and `https://*.vercel.app`.  
Allowed headers: `Content-Type`, `X-Session-ID`.  
Configured in `CorsConfig.java`.

## Error Codes Reference

| Code | HTTP | Trigger |
|------|------|---------|
| `PRODUCT_NOT_FOUND` | 404 | Product ID does not exist |
| `CART_ITEM_NOT_FOUND` | 404 | Item not present in cart |
| `ORDER_NOT_FOUND` | 404 | Order ID does not exist |
| `INSUFFICIENT_INVENTORY` | 400 / 409 | Cart: 400 · Order checkout: 409 |
| `VALIDATION_ERROR` | 400 | Bean Validation failure on request body |
| `BAD_REQUEST` | 400 | e.g. empty cart on checkout |
| `INTERNAL_ERROR` | 500 | Unhandled exception |
