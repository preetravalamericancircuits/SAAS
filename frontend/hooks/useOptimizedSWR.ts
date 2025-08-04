import useSWR, { SWRConfiguration } from 'swr';
import { apiClient } from '@/lib/api';

// Optimized SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  loadingTimeout: 10000,
};

// Custom hook for optimized data fetching
export function useOptimizedSWR<T>(
  key: string | null,
  config?: SWRConfiguration
) {
  return useSWR<T>(
    key,
    (url: string) => apiClient.get<T>(url),
    { ...defaultConfig, ...config }
  );
}

// Specialized hooks for common endpoints
export const useUsers = () => useOptimizedSWR('/api/users');
export const useTasks = () => useOptimizedSWR('/api/tasks');
export const useCurrentUser = () => useOptimizedSWR('/api/auth/me');