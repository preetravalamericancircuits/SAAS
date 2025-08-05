import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Inter, Roboto } from 'next/font/google';

// Optimize Google Fonts with next/font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

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
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <main className={`${inter.variable} ${roboto.variable} font-sans`}>
            <AppContent {...props} />
            <Toaster position="top-right" richColors />
          </main>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}
