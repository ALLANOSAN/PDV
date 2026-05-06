import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('Credenciais inválidas ou erro no servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
      <div className="flex-1 p-12 flex flex-col justify-center bg-emerald-500">
        <h1 className="text-8xl font-black text-gray-900 tracking-tighter uppercase leading-none">
          ACESSO <br />
          SISTEMA
        </h1>
        <p className="mt-8 text-2xl font-bold text-gray-900 opacity-80 uppercase tracking-tighter">
          Autenticação Industrial PDV PRO
        </p>
      </div>

      <div className="flex-1 bg-white p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Email Corporativo
              </label>
              <input
                {...register('email')}
                className="w-full border-b-4 border-gray-900 p-4 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="exemplo@empresa.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm font-bold text-red-500 uppercase">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Chave de Acesso
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full border-b-4 border-gray-900 p-4 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-sm font-bold text-red-500 uppercase">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm font-bold text-red-500 uppercase">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gray-900 text-white font-black uppercase p-6 text-xl hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
            </button>
          </form>

          <div className="mt-12 flex justify-between items-center text-xs font-black uppercase tracking-widest">
            <Link to="/" className="text-gray-400 hover:text-gray-900">Voltar</Link>
            <span className="text-gray-200">|</span>
            <Link to="/register" className="text-emerald-500 hover:text-gray-900">Criar Conta</Link>
            <span className="text-gray-200">|</span>
            <button className="text-gray-400 hover:text-gray-900">Esqueci a Senha</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
