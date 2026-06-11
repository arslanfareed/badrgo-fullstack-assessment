import { apiClient, unwrap } from '@/lib/api-client';
import type { ApiSuccess, DailySummary, DashboardOverview } from '@/types/api';

export interface DailySummaryFilters {
  date?: string;
  from?: string;
  to?: string;
}

export const reportsService = {
  getOverview: () =>
    unwrap<DashboardOverview>(apiClient.get<ApiSuccess<DashboardOverview>>('/reports/overview')),

  getDailySummary: (filters: DailySummaryFilters) =>
    unwrap<DailySummary[]>(
      apiClient.get<ApiSuccess<DailySummary[]>>('/reports/daily-summary', { params: filters }),
    ),
};
