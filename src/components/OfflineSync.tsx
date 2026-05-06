import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const OfflineSync = () => {
  useEffect(() => {
    const sync = async () => {
      const pendingKeys = Object.keys(localStorage).filter(k => k.startsWith('pending_sale_'));
      if (pendingKeys.length === 0) return;

      toast.info('Sincronizando vendas pendentes...');
      
      for (const key of pendingKeys) {
        const { saleData, cart } = JSON.parse(localStorage.getItem(key)!);
        try {
          const { data: sale, error } = await supabase.from('sales').insert([saleData]).select().single();
          if (error) throw error;
          
          await supabase.from('sale_items').insert(
            cart.map((i: any) => ({ 
              sale_id: sale.id, 
              product_id: i.product.id, 
              quantity: i.quantity, 
              unit_price: i.product.sale_price, 
              subtotal: i.quantity * i.product.sale_price 
            }))
          );
          
          localStorage.removeItem(key);
        } catch (e) {
          console.error('Falha ao sincronizar venda:', e);
        }
      }
      toast.success('Todas as vendas foram sincronizadas!');
    };

    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, []);
  return null;
};
