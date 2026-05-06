import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, LogOut, FileText, Search, CreditCard, Sun, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FileText size={20} /> },
    { name: 'Vendas', path: '/dashboard/sales', icon: <ShoppingCart size={20} /> },
    { name: 'Consulta', path: '/dashboard/price-check', icon: <Search size={20} /> },
    { name: 'Histórico', path: '/dashboard/history', icon: <FileText size={20} /> },
    { name: 'Estoque', path: '/dashboard/inventory', icon: <Package size={20} /> },
    { name: 'Caixa', path: '/dashboard/cashier', icon: <DollarSign size={20} /> },
    { name: 'Máquinas', path: '/dashboard/payments', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b dark:border-slate-700">
          <h2 className="text-lg font-bold text-indigo-600">PDV LOCAL PRO</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 gap-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t dark:border-slate-700">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="text-sm font-medium">Modo {theme === 'light' ? 'Escuro' : 'Claro'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full mt-2 p-3 flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900 dark:text-white transition-colors">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
