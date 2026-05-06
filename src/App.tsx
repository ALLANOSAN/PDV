import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import SalesPage from './pages/dashboard/SalesPage';
import PriceCheckPage from './pages/dashboard/PriceCheckPage';
import SalesHistoryPage from './pages/dashboard/SalesHistoryPage';
import InventoryPage from './pages/dashboard/InventoryPage';
import CashierPage from './pages/dashboard/CashierPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import LandingPage from './pages/LandingPage';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-4xl font-black animate-pulse">CARREGANDO...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" expand={true} richColors />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={session ? <Navigate to="/dashboard" /> : <LoginPage />} 
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
            <Route path="payments" element={<PaymentsPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
