import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "../../types";
import { Plus, Edit2, Trash2, X, RotateCcw } from "lucide-react";
import { CustomDialog } from "../../components/ui/CustomDialog";
import { DialogConfig } from "../../types/ui";

const productSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  sku: z.string().optional(),
  unit: z.string().min(1, "Unidade obrigatória"),
  cost_price: z.coerce.number().min(0),
  sale_price: z.coerce.number().min(0),
  stock_quantity: z.coerce.number().int().min(0),
});

type ProductForm = z.infer<typeof productSchema>;

function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof productSchema>>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      sku: "",
      unit: "un",
      cost_price: 0,
      sale_price: 0,
      stock_quantity: 0,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      try {
        if (editingProduct) {
          const { error } = await supabase
            .from("products")
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq("id", editingProduct.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("products")
            .insert([{ ...data, user_id: user.id }]);
          if (error) throw error;
        }
      } catch {
        // Fallback Offline
        const action = editingProduct ? "update" : "create";
        const pendingItem = {
          action,
          id: editingProduct?.id,
          data: editingProduct
            ? { ...data, updated_at: new Date().toISOString() }
            : { ...data, user_id: user.id },
          timestamp: new Date().toISOString(),
        };
        const existing = JSON.parse(
          localStorage.getItem("pending_products") || "[]",
        );
        localStorage.setItem(
          "pending_products",
          JSON.stringify([...existing, pendingItem]),
        );
        throw new Error("OFFLINE_SAVED");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        editingProduct ? "Produto atualizado!" : "Produto cadastrado!",
      );
      closeModal();
    },
    onError: (error: any) => {
      if (error.message === "OFFLINE_SAVED") {
        toast.warning("Offline! Alteração salva para sincronia futura.");
        closeModal();
      } else {
        toast.error("Erro ao salvar: " + error.message);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
      } catch {
        const pendingItem = {
          action: "delete",
          id,
          timestamp: new Date().toISOString(),
        };
        const existing = JSON.parse(
          localStorage.getItem("pending_products") || "[]",
        );
        localStorage.setItem(
          "pending_products",
          JSON.stringify([...existing, pendingItem]),
        );
        throw new Error("OFFLINE_SAVED");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto removido!");
    },
    onError: (error: any) => {
      if (error.message === "OFFLINE_SAVED") {
        toast.warning("Offline! Exclusão agendada.");
      } else {
        toast.error("Erro ao deletar.");
      }
    },
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      reset({
        ...product,
        sku: product.sku ?? undefined,
      });
    } else {
      setEditingProduct(null);
      reset({
        name: "",
        sku: "",
        unit: "un",
        cost_price: 0,
        sale_price: 0,
        stock_quantity: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-3 sm:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Essência Cosméticos - Estoque
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Controle total dos seus produtos e mercadorias.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2">
          <Plus size={20} strokeWidth={3} /> NOVO PRODUTO
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-400 font-bold animate-pulse uppercase tracking-widest p-12 justify-center">
          <RotateCcw className="animate-spin" /> Carregando estoque...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 sm:p-6">Código / SKU</th>
                  <th className="p-4 sm:p-6">Nome do Produto</th>
                  <th className="p-4 sm:p-6">Unidade</th>
                  <th className="p-4 sm:p-6">Estoque</th>
                  <th className="p-4 sm:p-6">Venda</th>
                  <th className="p-4 sm:p-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {products?.length === 0 ? (
                  <tr>
                    <td
                      className="p-12 text-center text-slate-400 font-medium italic"
                      colSpan={6}>
                      Nenhum produto encontrado no inventário.
                    </td>
                  </tr>
                ) : (
                  products?.map((product) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 sm:p-6 font-mono text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
                        {product.sku || "---"}
                      </td>
                      <td className="p-4 sm:p-6">
                        <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </span>
                      </td>
                      <td className="p-4 sm:p-6">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {product.unit}
                        </span>
                      </td>
                      <td className="p-4 sm:p-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-lg ${product.stock_quantity <= 5 ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>
                            {product.stock_quantity}
                          </span>
                          {product.stock_quantity <= 5 && (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 sm:p-6">
                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                          R${" "}
                          {product.sale_price.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="p-4 sm:p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setDialogConfig({
                                type: "confirm",
                                title: "Excluir Cadastro",
                                message:
                                  "Deseja excluir permanentemente o cadastro deste produto? Esta ação não pode ser desfeita.",
                                onConfirm: () => {
                                  deleteMutation.mutate(product.id);
                                  setDialogConfig(null);
                                },
                              });
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Modernizado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-6 sm:p-10 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
              <X size={24} />
            </button>

            <div className="mb-8">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                Preencha os dados técnicos da mercadoria.
              </p>
            </div>

            <form
              onSubmit={handleSubmit((data) =>
                saveMutation.mutate(data as ProductForm),
              )}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="col-span-2">
                <label
                  htmlFor="name"
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Nome Completo
                </label>
                <input
                  id="name"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  {...register("name")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Shampoo Hidratante 300ml"
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1 tracking-wider">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  SKU / Código Interno
                </label>
                <input
                  id="sku"
                  {...register("sku")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="789..."
                />
              </div>

              <div>
                <label
                  htmlFor="unit"
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Unidade de Medida
                </label>
                <select
                  id="unit"
                  {...register("unit")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
                  <option value="un">UNIDADE (UN)</option>
                  <option value="cx">CAIXA (CX)</option>
                  <option value="kit">KIT</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cost_price"
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Preço de Custo (R$)
                </label>
                <input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  {...register("cost_price")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="sale_price"
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Preço de Venda (R$)
                </label>
                <input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  {...register("sale_price")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold text-indigo-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="stock_quantity"
                  className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Quantidade em Estoque
                </label>
                <input
                  id="stock_quantity"
                  type="number"
                  {...register("stock_quantity")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full bg-indigo-600 text-white font-black uppercase p-5 rounded-2xl text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50">
                  {saveMutation.isPending
                    ? "Sincronizando..."
                    : "SALVAR NO SISTEMA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {dialogConfig && (
        <CustomDialog
          isOpen={!!dialogConfig}
          type={dialogConfig.type}
          title={dialogConfig.title}
          message={dialogConfig.message}
          onConfirm={(value) => {
            dialogConfig.onConfirm(value);
            setDialogConfig(null);
          }}
          onCancel={() => {
            setDialogConfig(null);
          }}
        />
      )}
    </div>
  );
}

export default InventoryPage;
