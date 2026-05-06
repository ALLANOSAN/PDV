import { ShoppingCart, Package, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <header className="w-full max-w-7xl flex justify-between items-center py-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
          PDV LOCAL PRO
        </h1>
        <nav>
          <Link 
            to="/login" 
            className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-500 transition-colors"
          >
            Acessar Sistema
          </Link>
        </nav>
      </header>

      <main className="w-full max-w-7xl mt-12">
        <section className="relative mb-32">
          <h2 className="text-[10vw] font-black leading-[0.85] text-gray-900 tracking-tighter uppercase mb-12">
            PONTO DE <br />
            VENDA <br />
            <span className="text-emerald-500">INDUSTRIAL</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <p className="text-2xl text-gray-500 font-medium leading-tight max-w-lg">
              Performance brutal para o seu comércio local. 
              Offline-ready, seguro e desenhado para durar.
            </p>
            <div className="flex gap-6">
              <Link 
                to="/login" 
                className="bg-gray-900 text-white text-xl font-black uppercase px-12 py-6 hover:bg-emerald-500 transition-all transform hover:-translate-y-1"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-4 border-gray-900">
          {[
            { title: 'Vendas', icon: <ShoppingCart size={48} />, desc: 'Processamento de vendas em milissegundos com suporte a múltiplas adquirentes.' },
            { title: 'Estoque', icon: <Package size={48} />, desc: 'Gestão granular de SKU, preços de custo e venda com alertas de ruptura.' },
            { title: 'Fluxo', icon: <DollarSign size={48} />, desc: 'Controle de caixa rigoroso com fechamentos cegos e registro de sangrias.' },
          ].map((item, i) => (
            <div key={i} className="p-12 border-r-4 border-gray-900 last:border-r-0 hover:bg-gray-50 transition-colors">
              <div className="mb-8 text-gray-900">{item.icon}</div>
              <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">{item.title}</h3>
              <p className="text-lg text-gray-600 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="w-full max-w-7xl py-12 border-t-2 border-gray-100 mt-20 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
        <p>© 2026 PDV LOCAL PRO - SISTEMA INDUSTRIAL</p>
        <p>CACHYOS LINUX SYSTEM</p>
      </footer>
    </div>
  )
}

export default LandingPage;
