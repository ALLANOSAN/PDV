import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sale, SaleItem } from "../../types";
import { X, Calendar, Search, FileDown, RotateCcw } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


function SalesHistoryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales-history', selectedDate, searchTerm],
    queryFn: async () => {
      const start = new Date(selectedDate).toISOString();
      const end = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1)).toISOString();
      
      let query = supabase
        .from('sales')
        .select('*, sale_items(*, products(*))')
        .gte('created_at', start)
        .lt('created_at', end)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`payment_method.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Sale & { sale_items: (SaleItem & { products: any })[] })[];
    },
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Relatório de Vendas - ${selectedDate}`, 14, 15);
    autoTable(doc, {
        head: [['ID', 'Produtos', 'Método', 'Total']],
        body: sales?.map(s => [
            s.id.slice(0, 8),
            s.sale_items.map(i => `${i.quantity}x ${i.products?.name}`).join(', '),
            s.payment_method.toUpperCase(),
            `R$ ${s.total_amount.toFixed(2)}`
        ]) || []
    });
    doc.save(`vendas-${selectedDate}.pdf`);
  };

  const cancelSale = async (sale: any) => {
    const password = prompt("Autenticação de Gerente necessária para cancelar venda:");
    if (!password) return;

    const managerPass = import.meta.env.VITE_MANAGER_PASSWORD || "1234";
    
    if (password !== managerPass) {
      toast.error('Senha de gerente incorreta!');
      return;
    }

    if (!confirm('Deseja CANCELAR esta venda? O estoque será devolvido.')) return;

    for (const item of sale.sale_items) {
      await supabase.from('products')
        .update({ stock_quantity: item.products.stock_quantity + item.quantity })
        .eq('id', item.product_id);
    }

    await supabase.from('sales').update({ status: 'canceled' }).eq('id', sale.id);
    queryClient.invalidateQueries({ queryKey: ['sales-history'] });
    toast.success('Venda cancelada!');
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Essência Cosméticos - Histórico</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Relatório detalhado de transações realizadas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onClick={exportPDF} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all">
                <FileDown size={18}/> Exportar PDF
            </button>
            <div className="relative group">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"/>
                <input 
                    placeholder="Filtrar por método..." 
                    className="pl-10 pr-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl dark:bg-slate-900 font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all w-full" 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
            <div className="relative group">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"/>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="pl-10 pr-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl dark:bg-slate-900 font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all w-full"
                />
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4">
            <RotateCcw className="animate-spin" size={32} />
            <span className="font-bold uppercase tracking-widest text-xs text-slate-500">Recuperando registros...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="p-6">Transação ID</th>
                    <th className="p-6">Conteúdo do Pedido</th>
                    <th className="p-6">Método</th>
                    <th className="p-6">Valor Total</th>
                    <th className="p-6 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {sales?.length === 0 ? (
                        <tr>
                            <td className="p-12 text-center text-slate-400 font-medium italic" colSpan={5}>
                                Nenhuma venda registrada para este período.
                            </td>
                        </tr>
                    ) : (
                        sales?.map(sale => (
                        <tr key={sale.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${sale.status === 'canceled' ? 'opacity-40 grayscale' : ''}`}>
                            <td className="p-6">
                                <span className="font-mono text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">#{sale.id.slice(0, 8)}</span>
                            </td>
                            <td className="p-6">
                                <div className="flex flex-col gap-0.5">
                                    <span className={`font-bold text-slate-800 dark:text-slate-100 ${sale.status === 'canceled' ? 'line-through' : ''}`}>
                                        {sale.sale_items.map(i => `${i.quantity}x ${i.products?.name || 'n/a'}`).join(', ')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                                        {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </td>
                            <td className="p-6 uppercase">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-widest ${sale.payment_method === 'cash' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {sale.payment_method}
                                </span>
                            </td>
                            <td className="p-6">
                                <span className={`font-black text-lg ${sale.status === 'canceled' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                    R$ {sale.total_amount.toFixed(2)}
                                </span>
                            </td>
                            <td className="p-6 text-right">
                                {sale.status !== 'canceled' && (
                                    <button 
                                        onClick={() => cancelSale(sale)} 
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Cancelar Venda"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                )}
                                {sale.status === 'canceled' && (
                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">Estornado</span>
                                )}
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}


export default SalesHistoryPage;
