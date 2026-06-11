import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { DailySummaryQueryDto } from './dto/daily-summary-query.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-summary')
  @ResponseMessage('Daily summary retrieved successfully')
  @ApiOperation({ summary: 'Daily credit/debit summary (computed from the ledger)' })
  getDailySummary(@Query() query: DailySummaryQueryDto) {
    return this.reportsService.getDailySummary(query);
  }

  @Get('overview')
  @ResponseMessage('Overview retrieved successfully')
  @ApiOperation({ summary: 'Dashboard totals (wallets, balance, credits, debits, count)' })
  getOverview() {
    return this.reportsService.getOverview();
  }
}
