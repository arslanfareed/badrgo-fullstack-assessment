import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // uuid_generate_v4() backs the UUID primary keys.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`CREATE TYPE "users_status_enum" AS ENUM ('ACTIVE', 'SUSPENDED')`);
    await queryRunner.query(
      `CREATE TYPE "wallets_status_enum" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transactions_type_enum" AS ENUM ('CREDIT', 'DEBIT')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(120) NOT NULL,
        "phone" varchar(32) NOT NULL,
        "email" varchar(255) NOT NULL,
        "status" "users_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_users" PRIMARY KEY ("id"),
        CONSTRAINT "uq_users_phone" UNIQUE ("phone"),
        CONSTRAINT "uq_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "currency" char(3) NOT NULL,
        "balance" numeric(18,2) NOT NULL DEFAULT '0',
        "status" "wallets_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_wallets" PRIMARY KEY ("id"),
        CONSTRAINT "uq_wallets_user_currency" UNIQUE ("user_id", "currency"),
        -- Last-line guard: balance can never go negative even if app logic is bypassed.
        CONSTRAINT "ck_wallets_balance_non_negative" CHECK ("balance" >= 0),
        CONSTRAINT "fk_wallets_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "wallet_id" uuid NOT NULL,
        "type" "transactions_type_enum" NOT NULL,
        "amount" numeric(18,2) NOT NULL,
        "balance_before" numeric(18,2) NOT NULL,
        "balance_after" numeric(18,2) NOT NULL,
        "reference_id" varchar(128) NOT NULL,
        "description" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_transactions" PRIMARY KEY ("id"),
        -- IDEMPOTENCY: global uniqueness of referenceId is enforced here, in the DB.
        CONSTRAINT "uq_transactions_reference" UNIQUE ("reference_id"),
        CONSTRAINT "ck_transactions_amount_positive" CHECK ("amount" > 0),
        CONSTRAINT "fk_transactions_wallet" FOREIGN KEY ("wallet_id")
          REFERENCES "wallets" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "ix_transactions_wallet_created" ON "transactions" ("wallet_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_transactions_created" ON "transactions" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "transactions_type_enum"`);
    await queryRunner.query(`DROP TYPE "wallets_status_enum"`);
    await queryRunner.query(`DROP TYPE "users_status_enum"`);
  }
}
