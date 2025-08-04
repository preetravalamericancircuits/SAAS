import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import NewLayout from '@/components/NewLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login' || router.pathname === '/';
  
  if (isLoginPage) {
    return <Component {...pageProps} />;
  }
  
  return (
    <NewLayout>
      <Component {...pageProps} />
    </NewLayout>
  );
}

export default function App(props: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent {...props} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
} 