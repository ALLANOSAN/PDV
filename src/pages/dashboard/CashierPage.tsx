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
  queryClient = useQueryClient();

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

  if (isLoading) return (
    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-4">
        <RotateCcw className="animate-spin" size={32} />
        <span className="font-bold uppercase tracking-widest text-xs">Sincronizando Fluxo...</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Essência Cosméticos - Caixa</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Controle as entradas e saídas do seu caixa.</p>
        </div>
        <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="pl-10 pr-4 py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl dark:bg-slate-900 font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de Status do Caixa */}
        <div className={`p-8 rounded-[2.5rem] border-2 transition-all shadow-xl shadow-slate-100 dark:shadow-none flex flex-col justify-between min-h-[300px] ${isClosed ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${isClosed ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {isClosed ? <Lock size={14} /> : <Unlock size={14} />}
                {isClosed ? 'Caixa Encerrado' : 'Caixa em Operação'}
            </div>
            
            {isClosed ? (
                <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-2">Troco de Abertura</span>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-red-300">R$</span>
                        <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-2 border-red-100 dark:border-red-900/20 p-4 pl-12 rounded-2xl font-black text-2xl text-red-600 outline-none focus:border-red-500 transition-all"/>
                    </div>
                </div>
            ) : (
                <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Saldo Esperado</span>
                    <div className="text-5xl font-black text-emerald-600 tracking-tighter mb-4">
                        <span className="text-2xl mr-1 opacity-50 font-bold">R$</span>
                        {expectedBalance.toFixed(2)}
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-300">R$</span>
                        <input type="number" placeholder="Valor Físico Final" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-emerald-900/20 p-4 pl-12 rounded-2xl font-black text-2xl text-emerald-600 outline-none focus:border-emerald-500 transition-all"/>
                    </div>
                </div>
            )}
          </div>

          <button 
            onClick={() => isClosed ? operationMutation.mutate({ type: 'open', amount: parseFloat(amount) || 0, reason: 'Abertura de Dia' }) : operationMutation.mutate({ type: 'close', amount: parseFloat(amount) || 0, reason: 'Fechamento de Dia' })} 
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${isClosed ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'} dark:shadow-none`}
          >
            {isClosed ? <Unlock size={20}/> : <Lock size={20}/>}
            {isClosed ? 'ABRIR CAIXA' : 'FECHAR CAIXA'}
          </button>
        </div>

        {/* Card de Novas Movimentações */}
        <div className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingDown size={18} className="text-indigo-500" /> Movimentação Avulsa
          </h3>
          
          <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Valor da Operação</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300">R$</span>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 pl-12 rounded-2xl font-black text-2xl outline-none focus:border-indigo-500 transition-all" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Justificativa / Motivo</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all" placeholder="Ex: Pagamento de Fornecedor" value={reason} onChange={e => setReason(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button onClick={() => operationMutation.mutate({ type: 'sangria', amount: parseFloat(amount), reason })} className="group bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 p-5 rounded-2xl font-black transition-all flex flex-col items-center gap-2">
                    <TrendingDown size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs uppercase tracking-widest">Sangria</span>
                </button>
                <button onClick={() => operationMutation.mutate({ type: 'reforco', amount: parseFloat(amount), reason })} className="group bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 p-5 rounded-2xl font-black transition-all flex flex-col items-center gap-2">
                    <TrendingUp size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs uppercase tracking-widest">Reforço</span>
                </button>
              </div>
          </div>
        </div>

        {/* Card de Histórico */}
        <div className="rounded-[2.5rem] border-2 border-slate-800 dark:border-slate-700 bg-slate-900 text-white shadow-2xl overflow-hidden flex flex-col h-[500px]">
          <div className="p-8 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">LOGS DO DIA</h3>
            <RotateCcw size={16} className="text-slate-600" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {operations?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-xs font-black uppercase tracking-widest gap-2">
                    <TrendingUp size={32} /> Sem registros
                </div>
            ) : (
                operations?.map((op) => (
                    <div key={op.id} className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center group transition-all">
                      <div>
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${op.type === 'sangria' ? 'text-red-400' : op.type === 'reforco' ? 'text-blue-400' : 'text-emerald-400'}`}>
                            {op.type}
                        </div>
                        <div className="font-black text-lg tracking-tight">R$ {op.amount.toFixed(2)}</div>
                        {op.reason && <div className="text-[10px] text-slate-500 font-bold uppercase truncate w-32">{op.reason}</div>}
                      </div>
                      <button onClick={() => handleEstorno(op)} className="p-2 text-slate-600 hover:text-white hover:bg-slate-700 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <RotateCcw size={18}/>
                      </button>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashierPage;
