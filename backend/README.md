# Wallet Portal - Backend (NestJS)

Wallet operations API: users, wallets, credit/debit ledger, and reports. See the root
[`README.md`](../README.md) and [`architecture.md`](../architecture.md) for the full picture.

## Run

```bash
docker compose up -d db        # from repo root, starts Postgres
cp .env.example .env
npm install
npm run start:dev              # migrations + seed run on boot; API on :3000
```

Swagger: http://localhost:3000/docs

## Scripts

| Script | Purpose |
|---|---|
| `npm run start:dev` | Watch-mode dev server |
| `npm run build` | Compile to `dist/` |
| `npm test` | Unit tests (no DB) |
| `npm run test:e2e` | Integration tests (requires Postgres) - concurrency + idempotency |
| `npm run migration:run` / `:revert` | Apply / roll back migrations manually |
| `npm run lint` / `format` | ESLint / Prettier |

## Layout

```
src/
├── common/        # Money VO, exceptions, filter, interceptor, transaction helper, pagination
├── modules/
│   ├── users/         # controller, service, repository, dto, entity
│   ├── wallets/       # credit/debit core: locking + idempotency + balance math
│   ├── transactions/  # append-only ledger + history
│   └── reports/       # daily summary + dashboard overview
├── config/        # env validation + TypeORM data-source
└── migrations/    # schema + seed
```

Key files: [`wallets.service.ts`](./src/modules/wallets/wallets.service.ts) (concurrency +
idempotency), [`money.value-object.ts`](./src/common/utils/money.value-object.ts) (float-safe money),
[`all-exceptions.filter.ts`](./src/common/filters/all-exceptions.filter.ts) (error contract).
