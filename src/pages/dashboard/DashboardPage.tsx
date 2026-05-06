import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Busca vendas dos últimos 7 dias
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data, error } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .gte('created_at', sevenDaysAgo);

      if (error) throw error;
      
      // Agrupa por dia
      const grouped = data.reduce((acc: any, sale) => {
        const date = format(new Date(sale.created_at), 'dd/MM');
        acc[date] = (acc[date] || 0) + Number(sale.total_amount);
        return acc;
      }, {});

      return Object.keys(grouped).map(date => ({ date, total: grouped[date] }));
    },
  });

  if (isLoading) return <div className="text-4xl font-black animate-pulse">CARREGANDO DADOS...</div>;

  return (
    <div className="space-y-12">
      <h2 className="text-6xl font-black uppercase tracking-tighter">Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="border-8 border-gray-900 p-8 h-[400px]">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Vendas (Últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={4} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border-8 border-gray-900 p-8 h-[400px]">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Volume de Vendas</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#1e3a8a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
