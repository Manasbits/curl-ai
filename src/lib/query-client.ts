import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import type { Query } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    structuralSharing: true,
    // Don't throw on error for cancelled queries
    throwOnError: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions });

if (typeof window !== 'undefined') {
  persistQueryClient({
    queryClient,
    persister: createSyncStoragePersister({ storage: window.localStorage }),
    // Only persist successful queries, not pending or error states
    // This prevents "dehydrated as pending ended up rejecting" errors
    dehydrateOptions: {
      shouldDehydrateQuery: (query: Query) => {
        // Only persist queries that are successful and have data
        // This prevents pending queries from being persisted and causing hydration errors
        return query.state.status === 'success' && query.state.data !== undefined;
      },
    },
  });
}
