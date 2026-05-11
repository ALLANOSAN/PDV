import {
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { TrendingUp, Users, ShoppingBag, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 30,
      ).toISOString();
      const { data: sales } = await supabase
        .from("sales")
        .select("*, sale_items(*)")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true })
        .limit(100);
      const { data: products } = await supabase.from("products").select("*");

      const salesList = sales || [];
      // Processamento de dados para gráficos
      const dailySales = salesList.reduce((acc: any, sale) => {
        const date = new Date(sale.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + sale.total_amount;
        return acc;
      }, {});

      const chartData = Object.entries(dailySales || {}).map(
        ([name, total]) => ({ name, total }),
      );

      const paymentData = [
        {
          name: "Dinheiro",
          value: sales?.filter((s) => s.payment_method === "cash").length || 0,
        },
        {
          name: "Cartão",
          value: sales?.filter((s) => s.payment_method === "card").length || 0,
        },
      ];

      return {
        totalSales: sales?.length || 0,
        revenue: sales?.reduce((acc, s) => acc + s.total_amount, 0) || 0,
        avgTicket: sales?.length
          ? sales.reduce((acc, s) => acc + s.total_amount, 0) / sales.length
          : 0,
        inventoryCount: products?.length || 0,
        chartData,
        paymentData,
      };
    },
  });

  const COLORS = ["#10b981", "#6366f1"];

  if (isLoading)
    return (
      <div className="p-12 animate-pulse font-black uppercase text-slate-400">
        Carregando métricas...
      </div>
    );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
          Painel de Performance
        </h2>
        <p className="text-slate-500 font-medium">
          Visão geral do crescimento do seu negócio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Faturamento Total",
            value: `R$ ${stats?.revenue.toFixed(2)}`,
            icon: <TrendingUp className="text-emerald-500" />,
            color: "bg-emerald-50 dark:bg-emerald-900/10",
          },
          {
            label: "Total de Vendas",
            value: stats?.totalSales,
            icon: <ShoppingBag className="text-indigo-500" />,
            color: "bg-indigo-50 dark:bg-indigo-900/10",
          },
          {
            label: "Ticket Médio",
            value: `R$ ${stats?.avgTicket.toFixed(2)}`,
            icon: <Users className="text-blue-500" />,
            color: "bg-blue-50 dark:bg-blue-900/10",
          },
          {
            label: "Itens no Estoque",
            value: stats?.inventoryCount,
            icon: <CreditCard className="text-amber-500" />,
            color: "bg-amber-50 dark:bg-amber-900/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-6 rounded-[2rem] border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all shadow-sm ${stat.color}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {stat.label}
              </span>
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">
            Faturamento por Dia
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">
            Métodos de Pagamento
          </h3>
          <div className="h-80 w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.paymentData?.map((entry, index) => ({
                    ...entry,
                    fill: COLORS[index % COLORS.length],
                  }))}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  nameKey="name"
                  // Não há suporte nativo para cornerRadius no Pie do Recharts 2.x
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Dinheiro
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Cartão
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
