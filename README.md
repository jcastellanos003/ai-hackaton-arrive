# BuyMore — AI Hackathon

Full-stack e-commerce demo. Spring Boot backend + Next.js frontend.

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.6+ |
| Node.js | 18+ |
| npm | 9+ |

---

## 1. Clone and enter the repo

```bash
git clone <repo-url>
cd ai-hackaton-arrive
```

---

## 2. Start the Backend

```bash
cd be
mvn spring-boot:run
```

- API ready at: `http://localhost:8080/v1`
- H2 console at: `http://localhost:8080/h2-console`
- Database is in-memory (H2) — auto-seeded with 16 products on first run.

> To build a JAR instead: `mvn package -DskipTests` then `java -jar target/buymore-api-0.0.1-SNAPSHOT.jar`

---

## 3. Start the Frontend

Open a **new terminal tab**, then:

```bash
cd fe/e-commerce

# Create the env file (one-time setup)
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/v1" > .env.local

# Install dependencies
npm install

# Start dev server
npm run dev
```

- App runs at: `http://localhost:3000`

---

## Running Both Together (quick copy-paste)

```bash
# Terminal 1 — Backend
cd be && mvn spring-boot:run

# Terminal 2 — Frontend
cd fe/e-commerce
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/v1" > .env.local
npm install
npm run dev
```

---

## Without the Backend (mock mode)

Skip step 2 and omit the `.env.local` file. The frontend falls back to a built-in mock layer automatically.

```bash
cd fe/e-commerce
npm install
npm run dev
```

---

## Project Structure

```
ai-hackaton-arrive/
├── be/          # Spring Boot API (Java 17, H2/PostgreSQL)
└── fe/          # Next.js 16 frontend (TypeScript, Tailwind, shadcn/ui)
```
