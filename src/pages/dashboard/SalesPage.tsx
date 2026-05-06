import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { toast } from 'sonner';
import { Search, X, CreditCard, Banknote, RefreshCw } from 'lucide-react';
import { CartItem, calculateTotal } from '../../lib/cart-engine';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useNavigate } from 'react-router-dom';
import { OfflineSync } from '../../components/OfflineSync';

function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showCashModal, setShowCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  
  const [receivedCash, setReceivedCash] = useState('');
  const [cardType, setCardType] = useState<'debit' | 'credit'>('debit');
  const [installments, setInstallments] = useState(1);
  
  const navigate = useNavigate();
  const total = calculateTotal(cart);

  const searchProducts = async (term: string) => {
    setSearchTerm(term);
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
  const clearCart = () => { if (confirm('Limpar todo o carrinho?')) setCart([]); };

  useKeyboardShortcuts({
    onF1: () => document.getElementById('search-input')?.focus(),
    onF2: () => setShowCashModal(true),
    onF3: () => navigate('/dashboard/cashier'),
    onF4: () => navigate('/dashboard/history'),
    onEsc: () => clearCart()
  });

  const getTimestamp = useCallback(() => Date.now(), []);

  const finalizeSale = async (method: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const saleData = { user_id: user?.id, total_amount: total, payment_method: method, status: 'completed' };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select().single();
      
      if (saleError) throw saleError;

      await supabase.from('sale_items').insert(
        cart.map(i => ({ sale_id: sale.id, product_id: i.product.id, quantity: i.quantity, unit_price: i.product.sale_price, subtotal: i.quantity * i.product.sale_price }))
      );

      for (const item of cart) {
        await supabase.from('products')
          .update({ stock_quantity: item.product.stock_quantity - item.quantity })
          .eq('id', item.product.id);
      }
      
      toast.success('Venda concluída!');
      setCart([]);
      setShowCashModal(false);
      setShowCardModal(false);
    } catch {
      localStorage.setItem(`pending_sale_${getTimestamp()}`, JSON.stringify({ saleData: { payment_method: method, total_amount: total }, cart }));
      toast.warning('Sem conexão! Venda salva localmente.');
      setCart([]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <OfflineSync />
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Frente de Caixa</h2>
        <button onClick={clearCart} className="flex items-center gap-2 bg-slate-200 p-2 rounded hover:bg-red-200">
            <RefreshCw size={18}/> Limpar Carrinho (ESC)
        </button>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" />
            <input id="search-input" className="w-full p-4 pl-10 border rounded-xl shadow-sm dark:bg-slate-800 dark:border-slate-700" placeholder="F1 - Buscar produto..." value={searchTerm} onChange={e => searchProducts(e.target.value)} />
          </div>
          
          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border rounded-xl shadow-sm mt-2 p-2 z-10 absolute w-full max-w-lg">
              {searchResults.map(p => (
                <button key={p.id} onClick={() => addToCart(p)} className="w-full p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex justify-between">
                    <span>{p.name}</span> <span>R$ {p.sale_price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 border rounded-xl shadow-sm mt-4 overflow-hidden">
            {cart.map(item => (
              <div key={item.product.id} className="p-4 flex justify-between items-center border-b dark:border-slate-700">
                <span>{item.product.name} x {item.quantity}</span>
                <button onClick={() => removeItem(item.product.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><X size={18}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-80 bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
          <div className="text-sm text-slate-500 uppercase font-bold">Total a pagar</div>
          <div className="text-4xl font-extrabold text-indigo-600 mb-6">R$ {total.toFixed(2)}</div>
          <button onClick={() => setShowCashModal(true)} disabled={isProcessing} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold mb-3 hover:bg-emerald-700 flex items-center justify-center gap-2"><Banknote size={18}/> F2 - Dinheiro</button>
          <button onClick={() => setShowCardModal(true)} disabled={isProcessing} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"><CreditCard size={18}/> Cartão</button>
        </div>
      </div>

      {showCashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-96 shadow-xl">
            <h3 className="font-bold mb-4">Receber Dinheiro</h3>
            <input type="number" className="w-full border p-3 rounded-lg mb-4 dark:bg-slate-700" value={receivedCash} onChange={e => setReceivedCash(e.target.value)} placeholder="Valor recebido" />
            <div className={`text-2xl font-black mb-6 ${parseFloat(receivedCash) >= total ? 'text-emerald-600' : 'text-red-600'}`}>
               Troco: R$ {Math.max(0, parseFloat(receivedCash) - total || 0).toFixed(2)}
            </div>
            <button onClick={() => finalizeSale('Dinheiro', parseFloat(receivedCash))} disabled={isProcessing} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">{isProcessing ? 'PROCESSANDO...' : 'FINALIZAR'}</button>
          </div>
        </div>
      )}

      {showCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-96 shadow-xl">
            <h3 className="font-bold mb-4">Pagamento Cartão</h3>
            <select className="w-full border p-3 rounded-lg mb-4 dark:bg-slate-700" onChange={(e) => setCardType(e.target.value as any)}>
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
            </select>
            {cardType === 'credit' && (
              <input type="number" className="w-full border p-3 rounded-lg mb-4 dark:bg-slate-700" placeholder="Parcelas" onChange={e => setInstallments(parseInt(e.target.value))} />
            )}
            <button onClick={() => {
              const msg = cardType === 'debit' ? 'Passe no DÉBITO. Aprovou?' : `Passe no CRÉDITO (${installments}x). Aprovou?`;
              if (confirm(msg)) finalizeSale(`Cartão ${cardType.toUpperCase()} ${cardType === 'credit' ? installments + 'x' : ''}`, total);
            }} disabled={isProcessing} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">CONFIRMAR</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default SalesPage;
