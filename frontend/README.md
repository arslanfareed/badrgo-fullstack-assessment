# Wallet Portal - Frontend (Next.js)

Operator UI for the wallet portal: dashboard, users, wallet detail (credit/debit + ledger), and
daily summary. See the root [`README.md`](../README.md) for the full picture and the manual test
checklist.

## Run

```bash
cp .env.example .env.local     # NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
npm install
npm run dev                    # http://localhost:3001
```

The backend must be running on `:3000` (or point `NEXT_PUBLIC_API_BASE_URL` elsewhere).

## Layout

```
src/
├── app/           # App Router pages: / (dashboard), /users, /wallets/[id], /reports
├── features/      # view logic: dashboard, users, wallets, reports
├── components/    # presentational UI (Card, Table, Button, FormField, Badge) + state views
├── hooks/         # React Query hooks (server state)
├── services/      # typed API clients (axios)
├── lib/           # api-client, query-client, money/date formatting
├── types/         # API contract types
└── constants/     # routes, query keys, currencies
```

## Conventions

- **Server state** lives in React Query hooks; components never call services directly.
- **Forms** use React Hook Form + Zod; schemas mirror the backend DTOs so validation matches.
- **Money** is formatted from the API's decimal string - never parsed to a JS number.
- Every data view renders explicit **loading / empty / error** states.
