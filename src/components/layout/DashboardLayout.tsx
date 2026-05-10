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
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <ShoppingCart size={24} weight="fill" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">ESSÊNCIA COSMÉTICOS</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema de Vendas</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3.5 gap-3.5 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl mb-4">
              <span>F1: Buscar</span>
              <span>F2: Dinheiro</span>
              <span>F3: Caixa</span>
              <span>F4: Histórico</span>
              <span>F5: Sangria</span>
              <span>F6: Log</span>
              <span>+/-: Qtd</span>
              <span>ESC: Limpar</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3.5 p-3.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="text-sm font-bold">Modo {theme === 'light' ? 'Escuro' : 'Claro'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full p-3.5 flex items-center gap-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="h-full">
            <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
