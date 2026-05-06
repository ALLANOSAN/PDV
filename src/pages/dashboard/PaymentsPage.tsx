import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Save } from 'lucide-react';

function PaymentsPage() {
  const queryClient = useQueryClient();
  const [configs, setConfigs] = useState({
    cielo: '',
    mercado_pago: '',
    sumup: ''
  });

  const saveConfig = async (provider: string, id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('payment_configs').upsert({
      user_id: user?.id,
      provider,
      credentials: { terminalId: id }
    }, { onConflict: 'user_id,provider' });
    toast.success(`Configuração ${provider} salva!`);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">Configurar Maquininhas</h2>
      <div className="space-y-8">
        {(['cielo', 'mercado_pago', 'sumup'] as const).map(p => (
          <div key={p} className="border-4 border-gray-900 p-8">
            <div className="flex items-center gap-4 mb-4">
              <CreditCard />
              <h3 className="font-black uppercase">{p.replace('_', ' ')}</h3>
            </div>
            <div className="flex gap-4">
              <input 
                placeholder="ID do Terminal / Token"
                className="flex-1 border-2 border-gray-900 p-3 font-bold"
                onChange={(e) => setConfigs(prev => ({...prev, [p]: e.target.value}))}
              />
              <button 
                onClick={() => saveConfig(p, configs[p])}
                className="bg-gray-900 text-white p-4 hover:bg-emerald-500"
              >
                <Save size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default PaymentsPage;
