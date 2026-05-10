import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Toaster } from 'sonner';
import { AppErrorBoundary } from './components/AppErrorBoundary';

// Lazy Loading das páginas
const ChangePasswordPage = lazy(() => import('./pages/auth/ChangePasswordPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const SalesPage = lazy(() => import('./pages/dashboard/SalesPage'));
const PriceCheckPage = lazy(() => import('./pages/dashboard/PriceCheckPage'));
const SalesHistoryPage = lazy(() => import('./pages/dashboard/SalesHistoryPage'));
const InventoryPage = lazy(() => import('./pages/dashboard/InventoryPage'));
const CashierPage = lazy(() => import('./pages/dashboard/CashierPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <AppErrorBoundary>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={session ? <Navigate to="/dashboard" /> : <LoginPage />}
              />
              <Route
                path="/change-password"
                element={session ? <ChangePasswordPage /> : <Navigate to="/login" />}
              />

              <Route
                path="/dashboard"
                element={session ? <DashboardLayout /> : <Navigate to="/login" />}
              >
                <Route index element={<DashboardPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="price-check" element={<PriceCheckPage />} />
                <Route path="history" element={<SalesHistoryPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="cashier" element={<CashierPage />} />
              </Route>

              <Route path="*" element={
                <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                  <h1 className="text-9xl font-black text-indigo-100 dark:text-slate-900 animate-pulse">404</h1>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-4 uppercase tracking-tighter">Página Perdida</p>
                  <p className="text-slate-500 mb-8 max-w-xs font-medium">O endereço que você tentou acessar não existe ou foi movido para outro setor.</p>
                  <button onClick={() => window.location.href = '/'} className="bg-indigo-600 text-white px-10 py-4 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:scale-105">Voltar ao Início</button>
                </div>
              } />
            </Routes>
          </Suspense>
        </Router>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
