import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, LogOut, FileText, Search, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
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
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 p-3 flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
