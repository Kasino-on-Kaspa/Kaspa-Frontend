import { useQuery } from "@tanstack/react-query";
import { getKaspaData, getKaspaHistoricalData, queryKeys } from "../utils/api";

export function useKaspaData() {
  return useQuery({
    queryKey: queryKeys.kaspaData,
    queryFn: getKaspaData,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useKaspaHistoricalData(
  interval: "1d" | "7d" | "30d" | "3m" | "1y" = "7d"
) {
  return useQuery({
    queryKey: queryKeys.kaspaHistorical(interval),
    queryFn: () => getKaspaHistoricalData(interval),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes (formerly cacheTime)
  });
}
