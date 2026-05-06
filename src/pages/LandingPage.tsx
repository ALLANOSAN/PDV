import { ShoppingCart, Package, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">PDV LOCAL PRO</h1>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Login</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <section className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Gestão inteligente para <br />
            <span className="text-indigo-600">o seu negócio.</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Ponto de venda moderno, rápido e seguro. Controle seu estoque e vendas com uma interface simples feita para você.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
              Começar agora <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Vendas Ágeis', icon: <ShoppingCart className="text-indigo-600" />, desc: 'Frente de caixa intuitiva para atender seus clientes em segundos.' },
            { title: 'Controle Total', icon: <Package className="text-indigo-600" />, desc: 'Gestão de estoque em tempo real com alertas de reposição.' },
            { title: 'Financeiro', icon: <DollarSign className="text-indigo-600" />, desc: 'Abertura, fechamento e controle de fluxo de caixa simplificado.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default LandingPage;
