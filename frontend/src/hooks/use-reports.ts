'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { reportsService, type DailySummaryFilters } from '@/services/reports.service';

export function useOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.overview,
    queryFn: () => reportsService.getOverview(),
  });
}

export function useDailySummary(filters: DailySummaryFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dailySummary, filters],
    queryFn: () => reportsService.getDailySummary(filters),
  });
}
