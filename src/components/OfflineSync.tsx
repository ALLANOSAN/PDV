import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const OfflineSync = () => {
  useEffect(() => {
    const sync = async () => {
      // 1. Sincronizar Vendas
      const pendingSales = JSON.parse(localStorage.getItem('pending_sales') || '[]');
      if (pendingSales.length > 0) {
        toast.info(`Sincronizando ${pendingSales.length} vendas pendentes...`);
        const remainingSales = [];

        for (const sale of pendingSales) {
          try {
            const { error } = await supabase.rpc('process_sale_with_stock', {
              p_user_id: sale.user_id,
              p_total_amount: sale.total_amount,
              p_payment_method: sale.payment_method,
              p_items: sale.items
            });
            if (error) throw error;
          } catch {
            remainingSales.push(sale);
            console.error('Falha ao sincronizar venda');
          }
        }
        
        localStorage.setItem('pending_sales', JSON.stringify(remainingSales));
        if (remainingSales.length === 0) toast.success('Vendas sincronizadas!');
      }

      // 2. Sincronizar Produtos (Estoque)
      const pendingProducts = JSON.parse(localStorage.getItem('pending_products') || '[]');
      if (pendingProducts.length > 0) {
        toast.info(`Sincronizando ${pendingProducts.length} alterações de estoque...`);
        const remainingProducts = [];

        for (const item of pendingProducts) {
          try {
            if (item.action === 'create') {
              const { error } = await supabase.from('products').insert([item.data]);
              if (error) throw error;
            } else if (item.action === 'update') {
              const { error } = await supabase.from('products').update(item.data).eq('id', item.id);
              if (error) throw error;
            } else if (item.action === 'delete') {
              const { error } = await supabase.from('products').delete().eq('id', item.id);
              if (error) throw error;
            }
          } catch {
            remainingProducts.push(item);
          }
        }
        localStorage.setItem('pending_products', JSON.stringify(remainingProducts));
        if (remainingProducts.length === 0) toast.success('Estoque sincronizado!');
      }
    };

    window.addEventListener('online', sync);
    // Tenta sincronizar ao carregar também
    if (navigator.onLine) sync();
    
    return () => window.removeEventListener('online', sync);
  }, []);

  return null;
};
