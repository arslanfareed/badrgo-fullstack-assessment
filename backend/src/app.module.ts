import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AppConfig, loadConfiguration } from './config/configuration';
import { dataSourceOptions } from './config/data-source';
import { validateEnvironment } from './config/env.validation';
import { ReportsModule } from './modules/reports/reports.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const database = configService.get<AppConfig['database']>('database')!;
        return {
          ...dataSourceOptions,
          host: database.host,
          port: database.port,
          username: database.username,
          password: database.password,
          database: database.name,
          // Migrations are applied on boot in containerized environments so the schema
          // and seed are ready without a manual step.
          migrationsRun: database.runMigrations,
        } as TypeOrmModuleOptions;
      },
    }),
    CommonModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    ReportsModule,
  ],
})
export class AppModule {}
