import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { toast } from 'sonner';
import { Search, Trash2, ShoppingCart, CreditCard, Banknote, X, Lock } from 'lucide-react';
import { CartItem, calculateTotal } from '../../lib/cart-engine';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useNavigate } from 'react-router-dom';

function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCashModal, setShowCashModal] = useState(false);
  const [receivedCash, setReceivedCash] = useState('');
  
  const navigate = useNavigate();
  const total = calculateTotal(cart);

  const searchProducts = async (term: string) => {
    if (term.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.from('products').select('*').or(`name.ilike.%${term}%,sku.ilike.%${term}%`).limit(5);
    setSearchResults(data || []);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setSearchTerm('');
    setSearchResults([]);
    toast.success(`${product.name} adicionado.`);
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  useKeyboardShortcuts({
    onF1: () => document.getElementById('search-input')?.focus(),
    onF2: () => setShowCashModal(true),
    onF3: () => navigate('/dashboard/cashier'),
    onF4: () => navigate('/dashboard/history'),
    onEsc: () => setCart([])
  });

  const finalizeSale = async (method: 'cash' | 'cielo' | 'mercado_pago' | 'sumup', amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: sale } = await supabase.from('sales').insert([{ user_id: user?.id, total_amount: total, payment_method: method, status: 'completed' }]).select().single();
    await supabase.from('sale_items').insert(cart.map(i => ({ sale_id: sale.id, product_id: i.product.id, quantity: i.quantity, unit_price: i.product.sale_price, subtotal: i.quantity * i.product.sale_price })));
    for (const item of cart) await supabase.from('products').update({ stock_quantity: item.product.stock_quantity - item.quantity }).eq('id', item.product.id);
    
    toast.success('Venda concluída!');
    setCart([]);
    setShowCashModal(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-slate-800">Frente de Caixa</h2>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <input id="search-input" className="w-full p-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500" placeholder="F1 - Buscar produto..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); searchProducts(e.target.value); }} />
          
          <div className="bg-white border rounded-xl shadow-sm mt-4 overflow-hidden">
            {cart.map(item => (
              <div key={item.product.id} className="p-4 flex justify-between items-center border-b last:border-0">
                <span className="font-semibold">{item.product.name} x {item.quantity}</span>
                <button onClick={() => removeItem(item.product.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-80 bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-sm text-slate-500 uppercase font-bold">Total a pagar</div>
          <div className="text-4xl font-extrabold text-indigo-600 mb-6">R$ {total.toFixed(2)}</div>
          <button onClick={() => setShowCashModal(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold mb-3 hover:bg-indigo-700">F2 - Dinheiro</button>
        </div>
      </div>

      {showCashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirmar Pagamento</h3>
            <input type="number" className="w-full border p-3 rounded-lg mb-4" value={receivedCash} onChange={e => setReceivedCash(e.target.value)} placeholder="Valor recebido" />
            <button onClick={() => finalizeSale('cash', parseFloat(receivedCash))} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">FINALIZAR</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default SalesPage;
