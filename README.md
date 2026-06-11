# Mini Operations Wallet Portal

A production-grade wallet operations portal - the financial control area used inside ride-hailing /
delivery platforms. Operators create users and wallets, credit and debit balances safely, audit a
full transaction ledger, and view daily/dashboard reports.

> Built for the Badrgo full-stack assessment. The design rationale, tradeoffs, and alternatives for
> every decision live in [`architecture.md`](./architecture.md).

| | Stack |
|---|---|
| **Backend** | NestJS, TypeORM, PostgreSQL, Swagger, Jest |
| **Frontend** | Next.js (App Router), TypeScript, React Query, React Hook Form, Zod, Tailwind |
| **Infra** | Docker Compose (Postgres + API + Web) |

---

## 1. Quick start (Docker - one command)

```bash
docker compose up --build
```

Then open:

- **Frontend** -> http://localhost:3001
- **API (Swagger)** -> http://localhost:3000/docs
- **API base** -> http://localhost:3000/api/v1

Migrations and demo seed data run automatically on backend boot, so the dashboard is populated
immediately.

### Run locally without Docker

```bash
# 1. Start Postgres (or use the compose db only):
docker compose up -d db

# 2. Backend
cd backend
cp .env.example .env          # defaults already point at the local db
npm install
npm run start:dev             # migrations run on boot; API on :3000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
npm install
npm run dev                   # web on :3001
```

---

## 2. Architecture at a glance

Modular monolith with **Clean Architecture** layering. Dependencies point inward; the domain knows
nothing about HTTP or the database.

```
Controller  -> validate DTO, delegate, shape response   (no business logic, no DB)
Service     -> business rules, transaction boundaries, idempotency, balance math
Domain      -> Money value object, invariants, custom exceptions   (pure, framework-free)
Repository  -> TypeORM persistence + pessimistic locking
```

```
backend/src/
├── common/        # Money VO, exceptions, exception filter, response interceptor, tx helper
├── modules/
│   ├── users/         # users (each with embedded wallets for navigation)
│   ├── wallets/       # create/read + credit/debit (locking, idempotency, balance math)
│   ├── transactions/  # append-only ledger + history
│   └── reports/       # daily summary + dashboard overview (computed projections)
├── config/        # env validation, TypeORM data-source
└── migrations/    # schema + seed

frontend/src/
├── app/           # App Router pages: dashboard, users, wallets/[id], reports
├── features/      # view logic per domain area
├── components/    # presentational UI + loading/empty/error states
├── hooks/         # React Query hooks (server state)
├── services/      # typed API clients
├── lib/           # axios client, query client, money/date formatting
├── types/ constants/
```

Full rationale, tradeoffs, and alternatives: [`architecture.md`](./architecture.md).

---

## 3. API reference

Base path `/api/v1`. Full interactive docs at `/docs` (Swagger).

| Method | Route | Description |
|---|---|---|
| `POST` | `/users` | Create a user |
| `GET` | `/users` | List users (paginated; embeds each user's wallets) |
| `POST` | `/wallets` | Create a wallet for a user |
| `GET` | `/wallets/:id` | Get a wallet (balance + status) |
| `POST` | `/wallets/:id/credit` | Credit a wallet (idempotent, transactional) |
| `POST` | `/wallets/:id/debit` | Debit a wallet (idempotent, locked, balance-checked) |
| `GET` | `/wallets/:id/transactions` | Ledger history (paginated, `?type=CREDIT\|DEBIT`) |
| `GET` | `/reports/daily-summary` | Per-day credits/debits/count (`?date=` or `?from=&to=`) |
| `GET` | `/reports/overview` | Dashboard totals (wallets, balance, credits, debits, count) |

### Response envelope

```jsonc
// success
{ "success": true, "message": "Wallet credited successfully", "data": { /* ... */ } }
// error
{ "success": false, "message": "Insufficient balance: available 50.00, requested 100.00", "errors": [] }
```

### Example

```bash
# Credit a wallet (idempotency key = referenceId)
curl -X POST http://localhost:3000/api/v1/wallets/<WALLET_ID>/credit \
  -H 'Content-Type: application/json' \
  -d '{ "amount": "100.50", "referenceId": "order-7f3a2b", "description": "Top-up" }'
```

### Error -> HTTP status

| Condition | Status | Exception |
|---|---|---|
| Wallet missing | 404 | `WalletNotFoundException` |
| Duplicate `referenceId` | 409 | `DuplicateReferenceException` |
| Insufficient balance | 422 | `InsufficientBalanceException` |
| Wallet not active | 422 | `WalletInactiveException` |
| Invalid request body | 400 | validation |

---

## 4. Money is never a float

| Layer | Representation |
|---|---|
| Storage | PostgreSQL `NUMERIC(18,2)` |
| Transport (JSON) | decimal **string** (`"100.50"`) |
| Computation | `Money` value object over integer minor units (`bigint` cents) |

All arithmetic happens in integer space, so there is no IEEE-754 rounding error
([`money.value-object.ts`](./backend/src/common/utils/money.value-object.ts)). The classic
`0.1 + 0.2` trap is covered by a unit test.

---

## 5. Concurrency - two debits cannot overdraw

Every credit/debit runs inside a single DB transaction and **locks the wallet row**
(`SELECT ... FOR UPDATE`) before reading the balance. A second concurrent operation on the same wallet
blocks until the first commits, then re-reads the updated balance and re-checks sufficiency - so an
overdraw is structurally impossible. A `CHECK (balance >= 0)` constraint is the database-level
backstop. See [`wallets.service.ts`](./backend/src/modules/wallets/wallets.service.ts) (`execute`).

Why pessimistic locking over optimistic / atomic-update alternatives, and the isolation-level
choice, are discussed in [`architecture.md` §5](./architecture.md).

---

## 6. Idempotency - same referenceId never moves money twice

1. **DB `UNIQUE` constraint** on `transactions.reference_id` is the real guarantee: under a
   concurrent double-submit, exactly one INSERT wins and the other raises a unique violation that is
   mapped to `DuplicateReferenceException` (409).
2. An **application pre-check** inside the transaction returns the clean 409 early in the common case.

We **reject** duplicates (assessment requirement). The production evolution - *idempotent replay*,
returning the original transaction with 200 so a retried-after-timeout client gets the same result -
is described in [`architecture.md` §6](./architecture.md).

---

## 7. Testing

```bash
cd backend
npm test          # unit tests (no DB): Money VO + credit/debit/duplicate/insufficient + guards
npm run test:e2e  # integration (requires Postgres): concurrency + idempotency under real load
```

Unit suite (13 tests) runs without a database. The **concurrency proof** is an integration test
([`wallet-concurrency.e2e-spec.ts`](./backend/test/wallet-concurrency.e2e-spec.ts)) - it fires 10
concurrent debits that would total more than the balance and asserts exactly the affordable subset
succeeds and the wallet lands at `0.00`; it also fires the same `referenceId` twice concurrently and
asserts exactly one succeeds (201) and the duplicate is rejected (409). Run `docker compose up -d db`
first.

Mapping to the required cases: credit, debit, duplicate referenceId, insufficient balance,
concurrent debits cannot overdraw.

### Frontend manual test checklist

- [ ] **Dashboard** shows five cards (wallets, balance, credits, debits, count) with seeded totals.
- [ ] **Users**: create a user - invalid email/phone show inline errors; success message appears; list refreshes.
- [ ] **Users**: add a wallet to a user (pick a currency) - duplicate currency for the same user shows an error.
- [ ] **Wallet detail**: open a wallet from a user - balance and status render.
- [ ] **Credit**: submit a credit - success message shows the new balance; ledger and dashboard update.
- [ ] **Debit**: submit a debit larger than the balance - "Insufficient balance" error; balance unchanged.
- [ ] **Idempotency**: reuse a `referenceId` - clear "already processed" error.
- [ ] **Transactions**: filter by CREDIT/DEBIT; paginate Previous/Next.
- [ ] **Reports**: set a date range and apply; empty range shows the empty state.
- [ ] **States**: loading spinners, empty states, and error states are all visible across pages.

---

## 8. Scaling to millions of transactions / month

- **Read replicas** - route reads (wallet, history, reports) to replicas; writes to primary.
- **Redis caching** - cache hot balances and daily summaries; invalidate on write. The ledger stays
  the source of truth, so a cache miss is always recoverable.
- **Event-driven processing** - transactional outbox: write the ledger row and an outbox event in one
  DB transaction, then relay to a broker (Kafka/SQS) for downstream consumers.
- **Audit logs** - the append-only ledger is already an audit trail; add an event stream for
  non-financial actions.
- **CQRS** - separate the locked write model (ledger) from denormalized read projections for dashboards.
- **Partitioned transaction tables** - range-partition `transactions` by month; archive/detach old
  partitions, keep indexes small, and let the daily summary scan only relevant partitions.

Expanded in [`architecture.md` §8](./architecture.md).

---

## 9. Environment variables

**Backend** (`backend/.env`, see `.env.example`)

| Var | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | API port |
| `API_PREFIX` | `api/v1` | Global route prefix |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | Postgres connection |
| `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | `wallet` / `wallet` / `wallet_portal` | Credentials |
| `DB_RUN_MIGRATIONS` | `true` | Run migrations + seed on boot |
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed frontend origin |

**Frontend** (`frontend/.env.local`, see `.env.example`)

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000/api/v1` | Backend API base (baked into the browser bundle) |

---
