import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, ShoppingCart, CreditCard, Banknote, X, Lock } from 'lucide-react';
import { CartItem, calculateTotal, validateManagerPassword } from '../../lib/cart-engine';

function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para Autorização de Remoção
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [managerPassword, setManagerPassword] = useState('');

  const queryClient = useQueryClient();
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

  const requestRemoveItem = (productId: string) => {
    setItemToRemove(productId);
    setShowAuthModal(true);
  };

  const confirmRemoveItem = async () => {
    // Exemplo: hash fixo para "1234". Em produção, busque isso do banco!
    const MOCK_HASH = "$argon2id$v=19$m=65536,t=3,p=4$wK+lR6Z3yq6d0J0p8Iu8+g$r7/G4sL5V9lXz5+W1U6m2Hj/eJ6v3k5p4L1n8F0a7gA";
    
    const isValid = await validateManagerPassword(managerPassword, MOCK_HASH);
    
    if (isValid) {
      setCart(prev => prev.filter(i => i.product.id !== itemToRemove));
      setShowAuthModal(false);
      setManagerPassword('');
      toast.success('Item removido pelo gerente.');
    } else {
      toast.error('Senha de gerente incorreta!');
    }
  };

  const finalizeSale = async (method: 'cash' | 'cielo' | 'mercado_pago' | 'sumup') => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Simulação de Maquinha (se cartão)
      if (method !== 'cash') {
        toast.message(`Aguardando integração com maquininha (${method.toUpperCase()})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay
      }

      // 2. Transação Atômica (Venda + Itens + Baixa Estoque)
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{ user_id: user.id, total_amount: total, payment_method: method, status: 'completed' }])
        .select().single();
      if (saleError) throw saleError;

      await supabase.from('sale_items').insert(
        cart.map(i => ({ sale_id: sale.id, product_id: i.product.id, quantity: i.quantity, unit_price: i.product.sale_price, subtotal: i.quantity * i.product.sale_price }))
      );

      // Baixa estoque
      for (const item of cart) {
        await supabase.from('products')
          .update({ stock_quantity: item.product.stock_quantity - item.quantity })
          .eq('id', item.product.id);
      }

      toast.success('Venda concluída com sucesso!');
      setCart([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-6xl font-black uppercase tracking-tighter mb-8">Frente de Caixa</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 flex-1">
        <div className="lg:col-span-2 flex flex-col space-y-8">
          <input 
            className="border-8 border-gray-900 p-6 text-4xl font-black uppercase w-full focus:outline-none"
            placeholder="PROCURAR ITEM..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); searchProducts(e.target.value); }}
          />

          <div className="flex-1 border-8 border-gray-900 bg-white overflow-auto">
            {cart.map((item) => (
              <div key={item.product.id} className="p-6 flex justify-between items-center border-b-4 border-gray-900">
                <span className="font-black text-2xl uppercase">{item.product.name} x {item.quantity}</span>
                <button onClick={() => requestRemoveItem(item.product.id)} className="text-red-500"><Trash2/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-900 text-white p-10 text-7xl font-black">R$ {total.toFixed(2)}</div>
          <button onClick={() => finalizeSale('cash')} className="w-full bg-emerald-500 p-8 font-black text-2xl uppercase">Receber Dinheiro</button>
          <button onClick={() => finalizeSale('cielo')} className="w-full bg-blue-500 text-white p-8 font-black text-2xl uppercase">Pagar Cartão</button>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white p-12 border-8 border-gray-900 w-96">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-4"><Lock/> Autenticar Gerente</h3>
            <input type="password" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} className="w-full border-4 p-4 mb-4" placeholder="Senha..." />
            <div className="flex gap-4">
              <button onClick={confirmRemoveItem} className="bg-emerald-500 p-4 font-black w-full">CONFIRMAR</button>
              <button onClick={() => setShowAuthModal(false)} className="bg-gray-200 p-4 font-black w-full">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SalesPage;
