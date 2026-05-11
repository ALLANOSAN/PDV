import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Product } from "../../types";
import { Search, Tag } from "lucide-react";
import { RotateCcw } from "lucide-react";

function PriceCheckPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;
    const timer = window.setTimeout(async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .limit(10);

      if (!isActive) return;
      setResults(data || []);
      setIsLoading(false);
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Essência Cosméticos - Consulta
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Verifique preços e estoque de forma rápida.
          </p>
        </div>
      </div>

      <div className="relative group max-w-2xl">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
          size={24}
        />
        <input
          className="w-full p-6 pl-16 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-slate-100 dark:shadow-none text-2xl font-black focus:border-indigo-500 outline-none transition-all"
          placeholder="NOME DO PRODUTO..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-400 font-bold animate-pulse uppercase tracking-widest p-12 justify-center">
          <RotateCcw className="animate-spin" size={32} />
          <span className="font-bold uppercase tracking-widest text-xs">
            Consultando banco...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center hover:border-indigo-200 transition-all group">
              <div>
                <div className="text-lg font-black uppercase text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {p.name}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {p.sku || "SEM SKU"}
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                <Tag size={20} /> R$ {p.sale_price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PriceCheckPage;
