import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Product, Sale, SaleItem } from '../../types';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, X, Lock } from 'lucide-react';
import { CartItem, calculateTotal } from '../../lib/cart-engine';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useNavigate } from 'react-router-dom';

function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [receivedCash, setReceivedCash] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const total = calculateTotal(cart);

  // Busca de vendas do dia para F4
  const { data: todaySales } = useQuery({
    queryKey: ['today-sales'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('sales').select('*, sale_items(*, products(*))').gte('created_at', today);
      return data as (Sale & { sale_items: (SaleItem & { products: any })[] })[];
    },
    enabled: showCancelModal
  });

  useKeyboardShortcuts({
    onF1: () => document.getElementById('search-input')?.focus(),
    onF2: () => setShowCashModal(true),
    onF3: () => navigate('/dashboard/cashier'),
    onF4: () => setShowCancelModal(true),
    onEsc: () => setCart([])
  });

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const finalizeSale = async (method: 'cash' | 'cielo' | 'mercado_pago' | 'sumup', amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: sale } = await supabase.from('sales').insert([{ user_id: user?.id, total_amount: total, payment_method: method, status: 'completed' }]).select().single();
    await supabase.from('sale_items').insert(cart.map(i => ({ sale_id: sale.id, product_id: i.product.id, quantity: i.quantity, unit_price: i.product.sale_price, subtotal: i.quantity * i.product.sale_price })));
    for (const item of cart) await supabase.from('products').update({ stock_quantity: item.product.stock_quantity - item.quantity }).eq('id', item.product.id);
    
    toast.success('Venda concluída!');
    setCart([]);
    setShowCashModal(false);
  };

  const cancelSale = async (sale: any) => {
    if (managerPassword !== '1234') return toast.error('Senha incorreta');
    for (const item of sale.sale_items) {
      await supabase.from('products').update({ stock_quantity: item.products.stock_quantity + item.quantity }).eq('id', item.product_id);
    }
    await supabase.from('sales').update({ status: 'canceled' }).eq('id', sale.id);
    toast.success('Venda cancelada!');
    setShowCancelModal(false);
    queryClient.invalidateQueries({ queryKey: ['today-sales'] });
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-4xl font-black uppercase mb-8">Frente de Caixa</h2>
      
      <input id="search-input" className="border-8 border-gray-900 p-6 text-2xl font-black w-full" placeholder="F1 - BUSCAR PRODUTO..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); /* logic */ }} />

      <div className="flex-1 border-8 border-gray-900 bg-white mt-4 overflow-auto">
        {cart.map(item => (
          <div key={item.product.id} className="p-4 flex justify-between border-b-2">
            <span>{item.product.name} x {item.quantity}</span>
            <button onClick={() => removeItem(item.product.id)} className="text-red-500"><X/></button>
          </div>
        ))}
      </div>

      {/* Modais F2 e F4 */}
      {showCashModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white p-12 border-8 border-gray-900 w-96">
            <h3 className="text-xl font-black mb-4">VALOR RECEBIDO</h3>
            <input type="number" className="w-full border-4 p-4 mb-4 text-2xl" value={receivedCash} onChange={e => setReceivedCash(e.target.value)} />
            <button onClick={() => finalizeSale('cash', parseFloat(receivedCash))} className="w-full bg-emerald-500 p-4 font-black">FINALIZAR (F2)</button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white p-12 border-8 border-gray-900 w-full max-w-2xl">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-4"><Lock/> CANCELAR VENDA</h3>
            <input type="password" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} className="w-full border-4 p-4 mb-4" placeholder="Senha Gerente" />
            <div className="space-y-2">
              {todaySales?.map(s => <button key={s.id} onClick={() => cancelSale(s)} className="w-full p-4 border-2 border-gray-900 text-left font-bold hover:bg-red-50">Venda {s.id.slice(0,8)} - R$ {s.total_amount}</button>)}
            </div>
            <button onClick={() => setShowCancelModal(false)} className="mt-4 w-full bg-gray-200 p-4 font-black">FECHAR</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default SalesPage;
