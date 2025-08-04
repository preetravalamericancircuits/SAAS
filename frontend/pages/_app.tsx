import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import NewLayout from '@/components/NewLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NewLayout>
          <Component {...pageProps} />
        </NewLayout>
      </AuthProvider>
    </QueryClientProvider>
  );
} 