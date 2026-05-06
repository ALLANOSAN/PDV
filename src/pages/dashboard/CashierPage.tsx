import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CashOperation } from '../../types';
import { RotateCcw, Lock, Unlock, TrendingDown, TrendingUp } from 'lucide-react';
import { calculateCurrentBalance } from '../../lib/cash-engine';

function CashierPage() {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  const { data: operations, isLoading } = useQuery({
    queryKey: ['cash-operations', selectedDate],
    queryFn: async () => {
      const start = new Date(selectedDate).toISOString();
      const end = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1)).toISOString();
      const { data, error } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', start)
        .lt('created_at', end)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CashOperation[];
    },
  });

  const lastOp = operations?.[0];
  const isClosed = !lastOp || lastOp.type === 'close';
  const expectedBalance = operations ? calculateCurrentBalance(operations) : 0;

  const operationMutation = useMutation({
    mutationFn: async (payload: Partial<CashOperation>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase.from('cash_operations').insert([{ ...payload, user_id: user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-operations'] });
      toast.success('Operação registrada com sucesso!');
      setAmount(''); setReason('');
    }
  });

  const handleCloseCash = () => {
    const counted = parseFloat(amount);
    if (isNaN(counted)) return toast.error("Informe o valor contado na gaveta!");
    
    const diff = counted - expectedBalance;
    if (Math.abs(diff) > 0.01 && !confirm(`Diferença de R$ ${diff.toFixed(2)} detectada. Fechar mesmo assim?`)) return;

    operationMutation.mutate({ type: 'close', amount: counted, reason: `Fechamento. Esperado: ${expectedBalance.toFixed(2)}. Diferença: ${diff.toFixed(2)}` });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-6xl font-black uppercase tracking-tighter">Gestão de Fluxo</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-4 border-gray-900 p-4 font-black uppercase"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className={`p-12 border-8 border-gray-900 ${isClosed ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <div className="text-sm font-black uppercase text-gray-500 mb-2">Status</div>
          <div className="text-5xl font-black uppercase mb-8">{isClosed ? 'FECHADO' : 'ABERTO'}</div>
          {isClosed ? (
            <div className="space-y-4">
              <input type="number" placeholder="Valor Abertura (Troco)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-4 border-gray-900 p-4 font-black"/>
              <button onClick={() => operationMutation.mutate({ type: 'open', amount: parseFloat(amount) || 0, reason: 'Abertura' })} className="w-full bg-gray-900 text-white p-6 font-black uppercase">Abrir Caixa</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-2xl font-black mb-4">Esperado: R$ {expectedBalance.toFixed(2)}</div>
              <input type="number" placeholder="Valor Físico na Gaveta" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-4 border-gray-900 p-4 font-black"/>
              <button onClick={handleCloseCash} className="w-full bg-gray-900 text-white p-6 font-black uppercase">Confrontar e Fechar</button>
            </div>
          )}
        </div>

        <div className="p-12 border-8 border-gray-900 bg-white">
          <h3 className="font-black uppercase mb-6 flex items-center gap-2"><TrendingDown/> Movimentação Segura</h3>
          <input className="w-full border-b-4 border-gray-900 p-4 mb-4 font-black" placeholder="Valor R$" value={amount} onChange={e => setAmount(e.target.value)} />
          <input className="w-full border-b-4 border-gray-900 p-4 mb-4 font-black" placeholder="Motivo da Sangria/Reforço" value={reason} onChange={e => setReason(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => operationMutation.mutate({ type: 'sangria', amount: parseFloat(amount), reason })} className="bg-red-500 text-white p-4 font-black uppercase flex items-center justify-center gap-2">Sangria</button>
            <button onClick={() => operationMutation.mutate({ type: 'reforco', amount: parseFloat(amount), reason })} className="bg-blue-500 text-white p-4 font-black uppercase flex items-center justify-center gap-2">Reforço</button>
          </div>
        </div>

        <div className="p-12 border-8 border-gray-900 bg-gray-900 text-white overflow-auto h-[500px]">
          <h3 className="text-emerald-500 font-black uppercase mb-6">Histórico</h3>
          {operations?.map((op) => (
            <div key={op.id} className="border-b border-gray-800 py-4 flex justify-between items-center">
              <div>
                <div className="font-black uppercase">{op.type}</div>
                <div className="text-sm font-bold">R$ {op.amount.toFixed(2)}</div>
                {op.reason && <div className="text-[10px] text-gray-400 italic">{op.reason}</div>}
              </div>
              <button onClick={() => operationMutation.mutate({ type: op.type === 'sangria' ? 'reforco' : 'sangria', amount: op.amount, reason: `Estorno: ${op.reason}` })} className="text-gray-500 hover:text-white"><RotateCcw size={20}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CashierPage;
