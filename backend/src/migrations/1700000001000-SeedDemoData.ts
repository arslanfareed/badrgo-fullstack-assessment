import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Demo seed so the dashboard is populated on first boot. All amounts and
 * balance_before / balance_after values below are pre-computed to be internally
 * consistent with the ledger (SUM(credits) - SUM(debits) == wallet balance).
 *
 * Idempotent: skips if any users already exist, so re-running migrations is safe.
 */
export class SeedDemoData1700000001000 implements MigrationInterface {
  name = 'SeedDemoData1700000001000';

  private readonly userAmir = '11111111-1111-1111-1111-111111111111';
  private readonly userLayla = '22222222-2222-2222-2222-222222222222';
  private readonly userOmar = '33333333-3333-3333-3333-333333333333';

  private readonly walletAmirUsd = 'aaaaaaaa-0000-0000-0000-000000000001';
  private readonly walletAmirEur = 'aaaaaaaa-0000-0000-0000-000000000002';
  private readonly walletLaylaUsd = 'bbbbbbbb-0000-0000-0000-000000000001';
  private readonly walletOmarUsd = 'cccccccc-0000-0000-0000-000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing = await queryRunner.query(`SELECT COUNT(*)::int AS count FROM "users"`);
    if (existing[0].count > 0) {
      return;
    }

    await queryRunner.query(
      `INSERT INTO "users" ("id", "name", "phone", "email", "status") VALUES
        ($1, 'Amir Hassan', '+201000000001', 'amir@example.com', 'ACTIVE'),
        ($2, 'Layla Mansour', '+201000000002', 'layla@example.com', 'ACTIVE'),
        ($3, 'Omar Khaled', '+201000000003', 'omar@example.com', 'SUSPENDED')`,
      [this.userAmir, this.userLayla, this.userOmar],
    );

    await queryRunner.query(
      `INSERT INTO "wallets" ("id", "user_id", "currency", "balance", "status") VALUES
        ($1, $5, 'USD', '950.00', 'ACTIVE'),
        ($2, $5, 'EUR', '150.00', 'ACTIVE'),
        ($3, $6, 'USD', '1650.00', 'ACTIVE'),
        ($4, $7, 'USD', '300.00', 'FROZEN')`,
      [
        this.walletAmirUsd,
        this.walletAmirEur,
        this.walletLaylaUsd,
        this.walletOmarUsd,
        this.userAmir,
        this.userLayla,
        this.userOmar,
      ],
    );

    await queryRunner.query(
      `INSERT INTO "transactions"
        ("wallet_id", "type", "amount", "balance_before", "balance_after", "reference_id", "description") VALUES
        ($1, 'CREDIT', '1000.00', '0.00',    '1000.00', 'seed-amir-usd-01', 'Initial top-up'),
        ($1, 'DEBIT',  '250.00',  '1000.00', '750.00',  'seed-amir-usd-02', 'Ride payment'),
        ($1, 'CREDIT', '500.00',  '750.00',  '1250.00', 'seed-amir-usd-03', 'Wallet reload'),
        ($1, 'DEBIT',  '300.00',  '1250.00', '950.00',  'seed-amir-usd-04', 'Delivery payment'),
        ($2, 'CREDIT', '200.00',  '0.00',    '200.00',  'seed-amir-eur-01', 'EUR top-up'),
        ($2, 'DEBIT',  '50.00',   '200.00',  '150.00',  'seed-amir-eur-02', 'EUR ride'),
        ($3, 'CREDIT', '750.00',  '0.00',    '750.00',  'seed-layla-usd-01', 'Initial top-up'),
        ($3, 'DEBIT',  '100.00',  '750.00',  '650.00',  'seed-layla-usd-02', 'Ride payment'),
        ($3, 'CREDIT', '1000.00', '650.00',  '1650.00', 'seed-layla-usd-03', 'Wallet reload'),
        ($4, 'CREDIT', '300.00',  '0.00',    '300.00',  'seed-omar-usd-01', 'Initial top-up')`,
      [this.walletAmirUsd, this.walletAmirEur, this.walletLaylaUsd, this.walletOmarUsd],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "transactions" WHERE "reference_id" LIKE 'seed-%'`);
    await queryRunner.query(`DELETE FROM "wallets" WHERE "id" IN ($1, $2, $3, $4)`, [
      this.walletAmirUsd,
      this.walletAmirEur,
      this.walletLaylaUsd,
      this.walletOmarUsd,
    ]);
    await queryRunner.query(`DELETE FROM "users" WHERE "id" IN ($1, $2, $3)`, [
      this.userAmir,
      this.userLayla,
      this.userOmar,
    ]);
  }
}
