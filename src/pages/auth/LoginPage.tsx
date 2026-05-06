import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error('Erro ao entrar: ' + error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Entrar no sistema</h1>
        <p className="text-slate-500 mb-8">Bem-vindo de volta ao PDV Pro.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input {...register('email')} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <input {...register('password')} type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            {loading ? 'Processando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Não tem conta? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Cadastrar-se</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
