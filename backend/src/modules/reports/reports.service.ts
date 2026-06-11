import { BadRequestException, Injectable } from '@nestjs/common';
import { Money } from '../../common/utils/money.value-object';
import { DailySummaryQueryDto } from './dto/daily-summary-query.dto';
import { DailySummaryDto } from './dto/daily-summary.dto';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { DailySummaryRow, OverviewRow, ReportsRepository } from './reports.repository';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 30;

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async getDailySummary(query: DailySummaryQueryDto): Promise<DailySummaryDto[]> {
    const { fromInclusive, toExclusive } = this.resolveRange(query);
    const rows = await this.reportsRepository.getDailySummaries(fromInclusive, toExclusive);
    return rows.map((row) => this.toDailySummaryDto(row));
  }

  async getOverview(): Promise<DashboardOverviewDto> {
    return this.toOverviewDto(await this.reportsRepository.getOverview());
  }

  /** Normalizes the query into a half-open [from, to) UTC range. */
  private resolveRange(query: DailySummaryQueryDto): {
    fromInclusive: Date;
    toExclusive: Date;
  } {
    if (query.date) {
      const start = this.parseDate(query.date);
      return { fromInclusive: start, toExclusive: new Date(start.getTime() + DAY_IN_MS) };
    }

    const to = query.to ? this.parseDate(query.to) : this.startOfToday();
    const from = query.from
      ? this.parseDate(query.from)
      : new Date(to.getTime() - DEFAULT_RANGE_DAYS * DAY_IN_MS);

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('"from" date must not be after "to" date.');
    }

    return { fromInclusive: from, toExclusive: new Date(to.getTime() + DAY_IN_MS) };
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private startOfToday(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private toDailySummaryDto(row: DailySummaryRow): DailySummaryDto {
    return {
      date: row.date,
      totalCredits: Money.fromDecimalString(row.totalCredits).toDecimalString(),
      totalDebits: Money.fromDecimalString(row.totalDebits).toDecimalString(),
      transactionCount: Number(row.transactionCount),
      activeWallets: Number(row.activeWallets),
    };
  }

  private toOverviewDto(row: OverviewRow): DashboardOverviewDto {
    return {
      totalWallets: Number(row.totalWallets),
      totalBalance: Money.fromDecimalString(row.totalBalance).toDecimalString(),
      totalCredits: Money.fromDecimalString(row.totalCredits).toDecimalString(),
      totalDebits: Money.fromDecimalString(row.totalDebits).toDecimalString(),
      transactionCount: Number(row.transactionCount),
    };
  }
}
