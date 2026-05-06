import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error('Erro ao criar conta: ' + error.message);
      setLoading(false);
    } else {
      toast.success('Conta criada com sucesso! Verifique seu email ou faça login.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row-reverse">
      <div className="flex-1 p-12 flex flex-col justify-center bg-gray-900 text-white">
        <h1 className="text-8xl font-black tracking-tighter uppercase leading-none">
          NOVA <br />
          CONTA
        </h1>
        <p className="mt-8 text-2xl font-bold text-emerald-500 uppercase tracking-tighter">
          Junte-se à Rede Industrial PDV PRO
        </p>
      </div>

      <div className="flex-1 bg-white p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Confirmar Chave
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full border-b-4 border-gray-900 p-4 text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm font-bold text-red-500 uppercase">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gray-900 text-white font-black uppercase p-6 text-xl hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              {loading ? 'PROCESSANDO...' : 'CRIAR MINHA CONTA'}
            </button>
          </form>

          <div className="mt-12 flex justify-center items-center text-xs font-black uppercase tracking-widest">
            <Link to="/login" className="text-gray-400 hover:text-gray-900">Já tenho uma conta. Voltar ao Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
