import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  sku: z.string().optional(),
  unit: z.string().default('un'),
  cost_price: z.coerce.number().min(0),
  sale_price: z.coerce.number().min(0),
  stock_quantity: z.coerce.number().int().min(0),
});

type ProductForm = z.infer<typeof productSchema>;

function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Product[];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...data, user_id: user.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto cadastrado!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto removido!');
    },
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      reset(product);
    } else {
      setEditingProduct(null);
      reset({ name: '', sku: '', unit: 'un', cost_price: 0, sale_price: 0, stock_quantity: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-6xl font-black uppercase tracking-tighter">Estoque</h2>
        <button 
          onClick={() => openModal()}
          className="bg-gray-900 text-white font-black uppercase px-8 py-4 hover:bg-emerald-500 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {isLoading ? (
        <div className="text-2xl font-black animate-pulse uppercase">Carregando estoque...</div>
      ) : (
        <div className="border-4 border-gray-900 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white text-xs font-black uppercase tracking-widest">
                <th className="p-6">SKU</th>
                <th className="p-6">Produto</th>
                <th className="p-6">Unid.</th>
                <th className="p-6">Estoque</th>
                <th className="p-6">Venda</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-900">
              {products?.length === 0 ? (
                <tr className="font-bold">
                  <td className="p-6 text-gray-400 italic" colSpan={6}>Nenhum produto cadastrado</td>
                </tr>
              ) : (
                products?.map((product) => (
                  <tr key={product.id} className="font-bold hover:bg-gray-50 transition-colors">
                    <td className="p-6 text-gray-400">{product.sku || '---'}</td>
                    <td className="p-6 uppercase">{product.name}</td>
                    <td className="p-6 text-xs uppercase">{product.unit}</td>
                    <td className={`p-6 ${product.stock_quantity <= 5 ? 'text-red-500' : ''}`}>
                      {product.stock_quantity}
                    </td>
                    <td className="p-6 text-emerald-600">
                      R$ {product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-right space-x-4">
                      <button onClick={() => openModal(product)} className="text-gray-900 hover:text-emerald-500">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm('Deseja remover este produto?')) deleteMutation.mutate(product.id);
                        }}
                        className="text-gray-900 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Industrial */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-8 border-gray-900 w-full max-w-2xl p-12 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X size={32} />
            </button>
            
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-8">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>

            <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nome do Produto</label>
                <input {...register('name')} className="w-full border-b-4 border-gray-900 p-2 font-bold text-xl focus:outline-none focus:border-emerald-500" />
                {errors.name && <p className="text-red-500 text-xs font-bold uppercase mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">SKU / Código</label>
                <input {...register('sku')} className="w-full border-b-4 border-gray-900 p-2 font-bold text-xl focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Unidade</label>
                <select {...register('unit')} className="w-full border-b-4 border-gray-900 p-2 font-bold text-xl focus:outline-none focus:border-emerald-500 bg-white">
                  <option value="un">UNIDADE (UN)</option>
                  <option value="kg">QUILO (KG)</option>
                  <option value="pt">PACOTE (PT)</option>
                  <option value="lt">LITRO (LT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Preço Custo</label>
                <input type="number" step="0.01" {...register('cost_price')} className="w-full border-b-4 border-gray-900 p-2 font-bold text-xl focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Preço Venda</label>
                <input type="number" step="0.01" {...register('sale_price')} className="w-full border-b-4 border-gray-900 p-2 font-bold text-xl focus:outline-none focus:border-emerald-500" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Qtd. em Estoque</label>
                <input type="number" {...register('stock_quantity')} className="w-full border-b-4 border-gray-900 p-2 font-bold text-xl focus:outline-none focus:border-emerald-500" />
              </div>

              <button 
                type="submit"
                disabled={saveMutation.isPending}
                className="col-span-2 bg-gray-900 text-white font-black uppercase p-6 text-xl hover:bg-emerald-500 transition-all disabled:opacity-50"
              >
                {saveMutation.isPending ? 'SALVANDO...' : 'CONFIRMAR REGISTRO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
