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
      toast.success('Operação registrada!');
      setAmount(''); setReason('');
    }
  });

  const handleEstorno = async (originalOp: CashOperation) => {
    if (!confirm('Deseja estornar esta movimentação?')) return;
    await operationMutation.mutateAsync({
      type: originalOp.type === 'sangria' ? 'reforco' : 'sangria',
      amount: originalOp.amount,
      reason: `ESTORNO de: ${originalOp.reason || 'Sem motivo'}`
    });
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">Carregando movimentações...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Gestão de Fluxo</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded-lg p-2 dark:bg-slate-700"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 border rounded-xl ${isClosed ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
          <div className="flex items-center gap-2 mb-4 font-bold text-slate-600 dark:text-slate-300">
            {isClosed ? <Lock size={20} className="text-red-500" /> : <Unlock size={20} className="text-emerald-500" />}
            <span>STATUS: {isClosed ? 'FECHADO' : 'ABERTO'}</span>
          </div>
          {isClosed ? (
            <div className="space-y-4">
              <input type="number" placeholder="Troco Inicial R$" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-3 rounded-lg dark:bg-slate-700"/>
              <button onClick={() => operationMutation.mutate({ type: 'open', amount: parseFloat(amount) || 0, reason: 'Abertura' })} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold">Abrir Caixa</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xl font-bold">Esperado: R$ {expectedBalance.toFixed(2)}</div>
              <input type="number" placeholder="Valor Físico" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-3 rounded-lg dark:bg-slate-700"/>
              <button onClick={() => operationMutation.mutate({ type: 'close', amount: parseFloat(amount) || 0, reason: 'Fechamento' })} className="w-full bg-slate-800 text-white p-3 rounded-lg font-bold">Fechar Caixa</button>
            </div>
          )}
        </div>

        <div className="p-6 border rounded-xl bg-white dark:bg-slate-800">
          <h3 className="font-bold mb-6 flex items-center gap-2"><TrendingDown/> Nova Movimentação</h3>
          <input className="w-full border p-3 mb-3 rounded-lg dark:bg-slate-700" placeholder="Valor R$" value={amount} onChange={e => setAmount(e.target.value)} />
          <input className="w-full border p-3 mb-3 rounded-lg dark:bg-slate-700" placeholder="Motivo" value={reason} onChange={e => setReason(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => operationMutation.mutate({ type: 'sangria', amount: parseFloat(amount), reason })} className="bg-red-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2"><TrendingDown size={16}/> Sangria</button>
            <button onClick={() => operationMutation.mutate({ type: 'reforco', amount: parseFloat(amount), reason })} className="bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2"><TrendingUp size={16}/> Reforço</button>
          </div>
        </div>

        <div className="p-6 border rounded-xl bg-slate-800 text-white overflow-auto h-[400px]">
          <h3 className="text-emerald-400 font-bold uppercase mb-4">Histórico Recente</h3>
          {operations?.map((op) => (
            <div key={op.id} className="border-b border-slate-700 py-3 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm">{op.type.toUpperCase()}</div>
                <div className="text-xs">R$ {op.amount.toFixed(2)}</div>
              </div>
              <button onClick={() => handleEstorno(op)} className="text-slate-400 hover:text-white"><RotateCcw size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CashierPage;
