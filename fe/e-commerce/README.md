# BuyMore — Frontend

Next.js 16 frontend for the BuyMore e-commerce demo. See the [root README](../../README.md) for full project setup instructions.

## Quick Start

```bash
cp .env.example .env.local   # configure API URL
pnpm install
pnpm dev                     # http://localhost:3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:8080/v1`. Omit to use the built-in mock layer. |
| `NEXT_PUBLIC_USE_MOCKS` | Set to `"true"` to force the mock layer even when `NEXT_PUBLIC_API_URL` is set. |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Start production server (requires `pnpm build`) |
| `pnpm lint` | Run ESLint |

## Mock Layer

When `NEXT_PUBLIC_API_URL` is not set, the app uses a built-in mock API with 13 seed products, simulated latency (400–800 ms), and in-memory cart/order state. No backend required.