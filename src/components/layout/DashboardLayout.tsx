import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, DollarSign, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FileText size={24} /> },
    { name: 'Vendas', path: '/dashboard/sales', icon: <ShoppingCart size={24} /> },
    { name: 'Consulta', path: '/dashboard/price-check', icon: <Search size={24} /> },
    { name: 'Histórico', path: '/dashboard/history', icon: <Search size={24} /> },
    { name: 'Estoque', path: '/dashboard/inventory', icon: <Package size={24} /> },
    { name: 'Caixa', path: '/dashboard/cashier', icon: <DollarSign size={24} /> },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar Industrial */}
      <aside className="w-24 md:w-64 border-r-4 border-gray-900 flex flex-col">
        <div className="p-8 border-b-4 border-gray-900">
          <h2 className="text-xl font-black uppercase tracking-tighter leading-none">
            PDV <br /> PRO
          </h2>
        </div>

        <nav className="flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-8 gap-4 border-b-4 border-gray-900 transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-gray-900' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="hidden md:block font-black uppercase tracking-widest text-xs">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="p-8 flex items-center gap-4 text-gray-400 hover:bg-red-500 hover:text-white transition-all border-t-4 border-gray-900"
        >
          <LogOut size={24} />
          <span className="hidden md:block font-black uppercase tracking-widest text-xs">Sair</span>
        </button>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-auto p-12">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
