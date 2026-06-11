import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';

/**
 * Integration proof for the two hardest business rules. Requires a running Postgres
 * (`docker compose up -d db`); these talk to a real database because pessimistic
 * locking and the unique constraint cannot be exercised against mocks.
 *
 *   - Concurrent debits can never overdraw the wallet.
 *   - The same referenceId can never move money twice, even fired concurrently.
 */
describe('Wallet concurrency & idempotency (e2e)', () => {
  let app: INestApplication;
  let walletId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    const unique = Date.now();
    const userRes = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ name: 'Concurrency Tester', phone: `+1${unique}`, email: `c${unique}@test.com` })
      .expect(201);

    const walletRes = await request(app.getHttpServer())
      .post('/api/v1/wallets')
      .send({ userId: userRes.body.data.id, currency: 'USD' })
      .expect(201);
    walletId = walletRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/wallets/${walletId}/credit`)
      .send({ amount: '100.00', referenceId: `seed-${unique}` })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('never overdraws under concurrent debits', async () => {
    // Balance is 100.00. Fire 10 concurrent debits of 20.00 each (would total 200.00).
    // At most 5 may succeed; the rest must be rejected with 422 (insufficient balance).
    const attempts = Array.from({ length: 10 }, (_, i) =>
      request(app.getHttpServer())
        .post(`/api/v1/wallets/${walletId}/debit`)
        .send({ amount: '20.00', referenceId: `debit-${Date.now()}-${i}` }),
    );

    const responses = await Promise.all(attempts);
    const succeeded = responses.filter((r) => r.status === 201).length;
    const rejected = responses.filter((r) => r.status === 422).length;

    expect(succeeded).toBe(5);
    expect(rejected).toBe(5);

    const finalWallet = await request(app.getHttpServer())
      .get(`/api/v1/wallets/${walletId}`)
      .expect(200);
    expect(finalWallet.body.data.balance).toBe('0.00');
  });

  it('processes a referenceId at most once under concurrent submits', async () => {
    const referenceId = `idem-${Date.now()}`;
    // Re-credit so there is balance to move, then fire the same debit reference twice at once.
    await request(app.getHttpServer())
      .post(`/api/v1/wallets/${walletId}/credit`)
      .send({ amount: '50.00', referenceId: `recredit-${Date.now()}` })
      .expect(201);

    const [first, second] = await Promise.all([
      request(app.getHttpServer())
        .post(`/api/v1/wallets/${walletId}/debit`)
        .send({ amount: '10.00', referenceId }),
      request(app.getHttpServer())
        .post(`/api/v1/wallets/${walletId}/debit`)
        .send({ amount: '10.00', referenceId }),
    ]);

    const statuses = [first.status, second.status].sort();
    // Exactly one succeeds (201); the duplicate is rejected with 409 Conflict.
    expect(statuses).toEqual([201, 409]);
  });
});
