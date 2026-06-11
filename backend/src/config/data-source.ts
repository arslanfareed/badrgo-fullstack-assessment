import { config as loadEnv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

loadEnv();

/**
 * Single source of truth for TypeORM connection options, shared by:
 *  - the NestJS runtime (via TypeOrmModule.forRootAsync) and
 *  - the TypeORM CLI for migrations (`npm run migration:*`).
 *
 * Glob paths are used so entities/migrations resolve in both ts-node (dev/CLI)
 * and compiled JS (production) without duplicating the list.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'wallet',
  password: process.env.DB_PASSWORD ?? 'wallet',
  database: process.env.DB_NAME ?? 'wallet_portal',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  // Schema is owned by migrations exclusively; never auto-sync in any environment.
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
