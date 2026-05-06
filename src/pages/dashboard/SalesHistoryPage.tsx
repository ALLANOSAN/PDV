import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sale, SaleItem } from '../../types';
import { X, Search } from 'lucide-react';
import { validateManagerPassword } from '../../lib/cart-engine';

function SalesHistoryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales-history', selectedDate],
    queryFn: async () => {
      const start = new Date(selectedDate).toISOString();
      const end = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1)).toISOString();
      const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*, products(*))')
        .gte('created_at', start)
        .lt('created_at', end)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Sale & { sale_items: (SaleItem & { products: any })[] })[];
    },
  });

  const cancelSale = async (sale: any) => {
    const password = prompt("Autenticação de Gerente necessária para cancelar venda:");
    if (!password) return;

    // Hash fixo para "1234".
    const MOCK_HASH = "$argon2id$v=19$m=65536,t=3,p=4$wK+lR6Z3yq6d0J0p8Iu8+g$r7/G4sL5V9lXz5+W1U6m2Hj/eJ6v3k5p4L1n8F0a7gA";
    
    const isValid = await validateManagerPassword(password, MOCK_HASH);
    if (!isValid) {
      toast.error('Senha de gerente incorreta!');
      return;
    }

    if (!confirm('Deseja CANCELAR esta venda? O estoque será devolvido.')) return;

    // 1. Reverter estoque
    for (const item of sale.sale_items) {
      await supabase.from('products')
        .update({ stock_quantity: item.products.stock_quantity + item.quantity })
        .eq('id', item.product_id);
    }

    // 2. Marcar como cancelada
    await supabase.from('sales').update({ status: 'canceled' }).eq('id', sale.id);
    
    queryClient.invalidateQueries({ queryKey: ['sales-history'] });
    toast.success('Venda cancelada com sucesso!');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-6xl font-black uppercase tracking-tighter">Histórico de Vendas</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-4 border-gray-900 p-4 font-black"/>
      </div>

      <div className="border-4 border-gray-900 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-white font-black uppercase text-xs">
            <tr>
              <th className="p-6">ID</th>
              <th className="p-6">Produtos</th>
              <th className="p-6">Total</th>
              <th className="p-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-gray-900">
            {sales?.map(sale => (
              <tr key={sale.id} className={sale.status === 'canceled' ? 'bg-red-50 text-gray-400 line-through' : ''}>
                <td className="p-6 font-mono text-sm">{sale.id.slice(0, 8)}</td>
                <td className="p-6 font-bold">
                  {sale.sale_items.map(i => `${i.quantity}x ${i.products.name}`).join(', ')}
                </td>
                <td className="p-6 font-black">R$ {sale.total_amount.toFixed(2)}</td>
                <td className="p-6">
                  {sale.status !== 'canceled' && (
                    <button onClick={() => cancelSale(sale)} className="text-red-500 hover:text-red-700"><X /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesHistoryPage;
