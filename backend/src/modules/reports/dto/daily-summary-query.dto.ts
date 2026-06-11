import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

/**
 * Filters for the daily summary. Either pass a single `date`, or a `from`/`to` range.
 * All are ISO date strings (YYYY-MM-DD). When omitted the service defaults to the last
 * 30 days so the report page is never empty on first load.
 */
export class DailySummaryQueryDto {
  @ApiPropertyOptional({ example: '2026-06-11', description: 'Single day (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: '2026-06-01', description: 'Range start (inclusive)' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2026-06-11', description: 'Range end (inclusive)' })
  @IsDateString()
  @IsOptional()
  to?: string;
}
