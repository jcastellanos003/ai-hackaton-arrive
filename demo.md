# BuyMore — AI Hackathon Demo

> **BuyMore** is a full-stack e-commerce platform built for the AI Hackathon. It showcases a modern, production-ready shopping experience with a Next.js frontend and a Spring Boot REST API backend, all containerized with Docker.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features & Functionalities](#features--functionalities)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Running the Application](#running-the-application)
8. [Project Structure](#project-structure)

---

## Overview

BuyMore is a fully functional e-commerce demo application titled **"Shop the Look"**. It supports browsing a product catalog, managing a shopping cart (no login required), and completing a checkout flow with order confirmation. The platform is designed to be run in mock mode (frontend only) or as a complete full-stack application.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.4 | React framework with App Router |
| **React** | 19.2.4 | UI rendering |
| **TypeScript** | 5.x | Static typing |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **shadcn/ui** + **Base UI** | 1.4.1 | Accessible UI components |
| **TanStack Query** | 5.100.5 | Server-state management & caching |
| **React Hook Form** | 7.74.0 | Form state management |
| **Zod** | 4.3.6 | Schema validation |
| **lucide-react** | 1.11.0 | Icon library |
| **sonner** | 2.0.7 | Toast notifications |
| **pnpm** | Latest | Package manager |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 17 | Runtime language |
| **Spring Boot** | 3.2.5 | Application framework |
| **Spring Web MVC** | 3.2.5 | REST API layer |
| **Spring Data JPA** + **Hibernate** | 6.x | ORM and database access |
| **Jakarta Bean Validation** | Latest | Request validation |
| **H2** | (runtime) | In-memory database for development |
| **PostgreSQL** | (optional) | Production database |
| **Lombok** | Latest | Boilerplate reduction |
| **Maven** | 3.6+ | Build tool |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |

---

## Architecture

The application follows a clear frontend/backend separation with well-defined integration points.

```
┌─────────────────────────────────────────────┐
│              Browser / Client               │
│          Next.js App (port 3000)            │
│                                             │
│  Page → Hook (TanStack Query) → Service     │
│       → api-client → REST API / Mocks       │
└────────────────────┬────────────────────────┘
                     │ HTTP + X-Session-ID header
                     ▼
┌─────────────────────────────────────────────┐
│         Spring Boot API (port 8080)         │
│                                             │
│  Controller → Service → Repository → DB     │
└────────────────────┬────────────────────────┘
                     │
                     ▼
           ┌─────────────────┐
           │  H2 (dev)       │
           │  PostgreSQL(prod)│
           └─────────────────┘
```

### Frontend Layers (5-tier)

1. **Page** — Next.js App Router route components
2. **Hook** — TanStack Query hooks for data fetching & mutations
3. **Service** — Business logic and data transformation
4. **api-client** — Centralized HTTP fetch wrapper
5. **Mock Layer** — Fully functional mock data (toggled via `NEXT_PUBLIC_USE_MOCKS`)

### Backend Layers

1. **Controller** — REST endpoints and request/response mapping
2. **Service** — Business logic, inventory validation, pricing
3. **Repository** — Spring Data JPA interfaces
4. **Entity** — JPA-mapped database models
5. **DTO** — Typed request/response contracts

---

## Features & Functionalities

### Product Catalog

- **16 pre-seeded products** across 4 categories: Footwear, Clothing, Accessories, Bags
- **Search** — case-insensitive substring match on name and description
- **Filter** — by category via sidebar navigation
- **Sort** — by price (asc/desc), name, rating, or newest
- **Pagination** — configurable page size (default 20, max 100)
- **Inventory badges** — "Out of Stock", "Only N left", or in-stock states
- **Featured products** — 6 products flagged for hero/spotlight placement

### Product Detail Page

- Full product info with image gallery and thumbnail row
- Quantity stepper capped at available inventory minus cart quantity
- "Add to Cart" button disabled when out of stock
- Related products section (up to 4, same category)
- Wishlist button (UI placeholder)

### Shopping Cart

- **Anonymous & session-based** — no login required; cart tied to a UUID stored in `localStorage`
- **Session header** — `X-Session-ID` sent with every cart request
- **Inventory enforcement** — 409 Conflict returned if quantity exceeds available stock
- **Optimistic UI** — instant updates with automatic rollback on error
- **Computed pricing:**
  - `Subtotal` = sum of item prices × quantities
  - `Tax` = subtotal × 8%
  - `Shipping` = free for orders ≥ $100, otherwise $9.99
  - `Total` = subtotal + tax + shipping

### Checkout & Orders

- **Shipping form fields:** First name, Last name, Email, Phone, Address, City, State, ZIP, Country
- **Payment fields (demo):** Card number (16 digits), Expiry (MM/YY), CVC (3–4 digits)
- Validation on both frontend (Zod) and backend (Jakarta Bean Validation)
- **Order number format:** `BM-{YEAR}-{NNNNN}` (e.g., `BM-2026-00001`)
- Estimated delivery: 3–5 business days (excluding weekends)
- Cart is automatically cleared after successful order placement
- Order confirmation page with timeline, item summary, and price breakdown

### UI/UX

- **Responsive grid** — 1 → 2 → 3 → 4 columns across breakpoints
- **Skeleton loaders** on all async data fetches
- **Error states** with retry buttons
- **Empty states** with call-to-action links
- **Toast notifications** (top-right, rich color via sonner)
- **Sticky header** with live search and cart badge (shows `99+` above 99 items)
- **Sidebar** — fixed overlay on mobile, sticky on desktop
- **Font** — Geist (variable, latin subset)

---

## API Reference

Base URL: `http://localhost:8080/v1`

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | Paginated product list (supports `search`, `category`, `sort`, `page`, `limit`) |
| `GET` | `/products/categories` | Category list with product counts |
| `GET` | `/products/{id}` | Single product detail |
| `GET` | `/products/{id}/related` | Related products (same category, up to 4) |

### Cart

> All cart endpoints require the `X-Session-ID: <uuid>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/cart` | Get the current session's cart |
| `POST` | `/cart/items` | Add a product to cart |
| `PATCH` | `/cart/items/{productId}` | Update item quantity |
| `DELETE` | `/cart/items/{productId}` | Remove a specific item |
| `DELETE` | `/cart` | Clear the entire cart |

### Orders

> All order endpoints require the `X-Session-ID: <uuid>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Place an order (validates inventory, clears cart) |
| `GET` | `/orders/{id}` | Retrieve order by UUID |

### Error Format

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

---

## Database Schema

Six tables with full relational integrity:

| Table | Purpose |
|---|---|
| `products` | Product catalog with UUID PK, pricing, inventory, images (JSON), tags, ratings |
| `carts` | Session-based carts with unique `session_id` |
| `cart_items` | Items in a cart; unique constraint on `(cart_id, product_id)` |
| `orders` | Placed orders with order number, status, pricing breakdown, customer info |
| `order_items` | Immutable snapshots of items at time of purchase |
| `shipping_addresses` | One-to-one shipping address per order |

- **Development:** H2 in-memory (`ddl-auto=create-drop`)
- **Production:** PostgreSQL (`ddl-auto=update`)

---

## Running the Application

### Option 1 — Frontend Only (Mock Mode, no backend needed)

```bash
cd fe/e-commerce
pnpm install
pnpm dev
# Visit http://localhost:3000
```

### Option 2 — Full Stack (Backend + Frontend)

```bash
# Terminal 1 — Start the backend
cd be
mvn spring-boot:run
# API available at http://localhost:8080/v1

# Terminal 2 — Start the frontend
cd fe/e-commerce
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/v1" > .env.local
pnpm install
pnpm dev
# App available at http://localhost:3000
```

### Option 3 — Docker Compose (All-in-One)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/v1 |
| H2 Console | http://localhost:8080/h2-console |

---

## Project Structure

```
ai-hackaton-arrive/
├── fe/e-commerce/              # Next.js 16 frontend
│   ├── app/                    # App Router pages (home, product, cart, checkout, confirmation)
│   ├── components/             # React components (layout, products, cart, checkout, ui)
│   ├── lib/                    # API client, services, hooks, types, constants
│   └── public/                 # Static assets
│
├── be/                         # Spring Boot 3 backend
│   └── src/main/java/
│       ├── controller/         # REST controllers (Product, Cart, Order)
│       ├── service/            # Business logic layer
│       ├── entity/             # JPA entities
│       ├── repository/         # Spring Data JPA repositories
│       ├── dto/                # Request/response DTOs
│       ├── exception/          # Custom exceptions + global error handler
│       └── config/             # CORS configuration
│
├── docker-compose.yml          # Full-stack container setup
├── README.md                   # Main project documentation
├── SPEC.md                     # Detailed feature specification
└── demo.md                     # This file
```
