import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error('Erro ao atualizar senha: ' + error.message);
      setLoading(false);
      return;
    }

    toast.success('Senha atualizada! Por favor, entre novamente com a nova senha.');
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-100 dark:bg-indigo-900/20 p-4 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400">
                <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Primeiro Acesso</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Por favor, defina uma nova senha para sua segurança.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nova Senha</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold text-lg focus:border-indigo-500 outline-none transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            {loading ? 'Atualizando...' : 'SALVAR E ACESSAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
