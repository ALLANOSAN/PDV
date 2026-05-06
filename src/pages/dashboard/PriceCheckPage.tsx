import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Search, Tag } from 'lucide-react';

function PriceCheckPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) { setResults([]); return; }
    
    setIsLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${term}%`)
      .limit(10);
    
    setResults(data || []);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h2 className="text-6xl font-black uppercase tracking-tighter">Consulta de Preço</h2>
      
      <div className="border-8 border-gray-900 p-8 flex items-center gap-4">
        <Search size={40} />
        <input 
          className="w-full text-4xl font-black uppercase tracking-tighter focus:outline-none"
          placeholder="NOME DO PRODUTO..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-2xl font-black animate-pulse uppercase">Consultando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map(p => (
            <div key={p.id} className="border-4 border-gray-900 p-6 flex justify-between items-center hover:bg-emerald-50 transition-all">
              <div>
                <div className="text-xl font-black uppercase">{p.name}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p.sku || 'SEM SKU'}</div>
              </div>
              <div className="text-3xl font-black text-emerald-600 flex items-center gap-2">
                <Tag size={24} /> R$ {p.sale_price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PriceCheckPage;
