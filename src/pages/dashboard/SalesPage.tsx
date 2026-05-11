import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Product } from "../../types";
import { toast } from "sonner";
import {
  Search,
  X,
  CreditCard,
  Banknote,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { calculateTotal, type CartItem } from "../../lib/cart-engine";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useNavigate } from "react-router-dom";
import { OfflineSync } from "../../components/OfflineSync";
import { CustomDialog } from "../../components/ui/CustomDialog";

interface DialogConfig {
  type: "confirm" | "alert" | "prompt";
  title: string;
  message: string;
  onConfirm: (value?: string) => void;
}

function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showCashModal, setShowCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const [receivedCash, setReceivedCash] = useState("");
  const [cardType, setCardType] = useState<"debit" | "credit">("debit");
  const [installments, setInstallments] = useState(1);

  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // ITEM 1: Busca segura via ilike do Supabase (evita SQL Injection)
  const performSearch = useCallback(async (term: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${term}%`)
      .limit(8);

    if (!error) setSearchResults(data || []);
  }, []);

  // ITEM 2: Debounce para performance e economia de banco
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  // ITEM 8: Uso da função centralizada de cálculo
  const total = calculateTotal(cart);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { product, quantity: 1 }];
    });
    setSearchTerm("");
    setSearchResults([]);
    toast.success(`${product.name} adicionado.`);
  };

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  const clearCart = () => {
    setDialogConfig({
      type: "confirm",
      title: "Limpar Carrinho",
      message:
        "Deseja limpar todo o carrinho? Essa ação não pode ser desfeita.",
      onConfirm: () => setCart([]),
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length === 1) {
      addToCart(searchResults[0]);
    }
  };

  useKeyboardShortcuts({
    onF1: () => document.getElementById("search-input")?.focus(),
    onF2: () => setShowCashModal(true),
    onF3: () => navigate("/dashboard/cashier"),
    onF4: () => navigate("/dashboard/history"),
    onF5: () => setShowCardModal(true),
    onF6: clearCart,
    onPlus: () => {
      if (selectedProductId) {
        setCart((prev) =>
          prev.map((i) =>
            i.product.id === selectedProductId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        );
      }
    },
    onMinus: () => {
      if (selectedProductId) {
        setCart((prev) =>
          prev.map((i) =>
            i.product.id === selectedProductId && i.quantity > 1
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          ),
        );
      }
    },
    onEsc: () => clearCart(),
  });

  const getTimestamp = useCallback(() => Date.now(), []);

  // ITEM 3: Transação Atômica via RPC + Cache Offline Robusto
  const finalizeSale = async (method: string, amount: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const saleItems = cart.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
      unit_price: i.product.sale_price,
      subtotal: i.quantity * i.product.sale_price,
    }));

    try {
      // Tenta a operação atômica (Venda + Itens + Estoque tudo de uma vez)
      const { error } = await supabase.rpc("process_sale_with_stock", {
        p_user_id: user?.id,
        p_total_amount: amount,
        p_payment_method: method,
        p_items: saleItems,
      });

      if (error) throw error;

      toast.success("Venda e Estoque atualizados!");
      setCart([]);
      setShowCashModal(false);
      setShowCardModal(false);
      setReceivedCash("");
      setInstallments(1);
    } catch {
      // Fallback offline: Salva a transação completa para sincronia posterior
      const pendingData = {
        id: `pending_${getTimestamp()}`,
        user_id: user?.id,
        total_amount: amount,
        payment_method: method,
        items: saleItems,
        timestamp: new Date().toISOString(),
      };

      const existing = JSON.parse(
        localStorage.getItem("pending_sales") || "[]",
      );
      localStorage.setItem(
        "pending_sales",
        JSON.stringify([...existing, pendingData]),
      );

      toast.warning("Offline! Venda salva para sincronia automática.");
      setCart([]);
      setShowCashModal(false);
      setShowCardModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-2 lg:p-4">
      <OfflineSync />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Essência Cosméticos - Frente de Caixa
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Registre suas vendas com rapidez e segurança.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200 ease-in-out border border-slate-200">
          <RefreshCw size={16} /> Limpar Carrinho (ESC)
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)]">
        {/* Lado Esquerdo: Busca e Lista de Itens */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg pointer-events-none">
              AUTO
            </div>
            <input
              id="search-input"
              className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-lg"
              placeholder="F1 - Buscar... (ENTER p/ adicionar)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl mt-1 p-2 z-20 absolute w-full max-w-xl translate-y-14 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full p-4 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl flex justify-between items-center group transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {p.name}
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      Estoque: {p.stock_quantity} {p.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      R$ {p.sale_price.toFixed(2)}
                    </span>
                    <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShoppingCart size={16} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Itens no Carrinho
              </span>
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {cart.length} itens
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                  <ShoppingCart size={48} strokeWidth={1.5} />
                  <p>Carrinho vazio. Use F1 para buscar.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    onClick={() => setSelectedProductId(item.product.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedProductId === item.product.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm"} flex justify-between items-center group animate-in fade-in zoom-in-95 duration-200`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {item.product.name}
                      </span>
                      <span className="text-sm text-slate-500">
                        {item.quantity}x R$ {item.product.sale_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {selectedProductId === item.product.id && (
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mr-2 bg-indigo-50 px-2 py-1 rounded-lg">
                          AUTO
                        </span>
                      )}
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                        R${" "}
                        {(item.product.sale_price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Resumo e Checkout */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-6">
            <div>
              <div className="text-sm text-slate-400 uppercase font-black tracking-widest mb-1">
                Total da Venda
              </div>
              <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                <span className="text-2xl mr-1 font-bold">R$</span>
                {total.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCashModal(true)}
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-3 text-lg group">
                <Banknote
                  size={22}
                  className="group-hover:scale-110 transition-transform"
                />
                F2 - Receber Dinheiro
              </button>

              <button
                onClick={() => setShowCardModal(true)}
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 text-lg group">
                <CreditCard
                  size={22}
                  className="group-hover:scale-110 transition-transform"
                />
                Cartão{" "}
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md uppercase">
                  Automatizado
                </span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-tighter">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{" "}
                Atalhos Ativos
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                Sincronização OK
              </div>
            </div>
          </div>

          <div className="hidden lg:block bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl">
            <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase mb-2">
              Dica do Sistema
            </h4>
            <p className="text-xs text-indigo-800/70 dark:text-indigo-300/60 leading-relaxed">
              Use <strong>F1</strong> para buscar rápido e <strong>ESC</strong>{" "}
              para limpar o carrinho se desistir da venda.
            </p>
          </div>
        </div>
      </div>

      {/* Modais com UI Melhorada */}
      {showCashModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Receber Dinheiro
              </h3>
              <button
                onClick={() => setShowCashModal(false)}
                className="text-slate-400 hover:text-slate-600">
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block tracking-wider">
                  Valor Recebido
                </label>
                <input
                  type="number"
                  autoFocus
                  className="w-full border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-2xl font-bold dark:bg-slate-700 focus:border-indigo-500 outline-none transition-all"
                  value={receivedCash}
                  onChange={(e) => setReceivedCash(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>Total da Venda</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">
                    Troco a devolver
                  </span>
                  <span
                    className={`text-3xl font-black ${parseFloat(receivedCash) >= total ? "text-emerald-600" : "text-slate-400"}`}>
                    R${" "}
                    {Math.max(0, parseFloat(receivedCash) - total || 0).toFixed(
                      2,
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => finalizeSale("cash", total)}
                disabled={isProcessing || parseFloat(receivedCash) < total}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                {isProcessing ? "PROCESSANDO..." : "FINALIZAR VENDA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCardModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight text-center w-full">
                Pagamento Cartão
              </h3>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6">
              <button
                onClick={() => setCardType("debit")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${cardType === "debit" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                Débito
              </button>
              <button
                onClick={() => setCardType("credit")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${cardType === "credit" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                Crédito
              </button>
            </div>

            <div className="space-y-6">
              {cardType === "credit" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider text-center">
                    Selecionar Parcelas
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                      <button
                        key={n}
                        onClick={() => setInstallments(n)}
                        className={`p-3 rounded-xl border-2 font-bold transition-all ${installments === n ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200"}`}>
                        {n}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-center">
                <div className="text-xs font-bold text-indigo-400 uppercase mb-1">
                  Valor na Maquininha
                </div>
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                  R$ {total.toFixed(2)}
                </div>
                <div className="text-[10px] font-bold text-indigo-500/60 uppercase mt-2 tracking-widest">
                  {cardType === "debit"
                    ? "MODALIDADE DÉBITO"
                    : `MODALIDADE CRÉDITO ${installments}X`}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  CANCELAR
                </button>
                <button
                  onClick={() => {
                    const msg =
                      cardType === "debit"
                        ? "Passe no DÉBITO. Aprovou?"
                        : `Passe no CRÉDITO (${installments}x). Aprovou?`;
                    setDialogConfig({
                      type: "confirm",
                      title: "Confirmar Pagamento",
                      message: msg,
                      onConfirm: () => finalizeSale("card", total),
                    });
                  }}
                  disabled={isProcessing}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                  {isProcessing ? "PROCESSANDO..." : "CONFIRMAR"}
                </button>
              </div>
            </div>
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
          onCancel={() => setDialogConfig(null)}
        />
      )}
    </div>
  );
}

export default SalesPage;
