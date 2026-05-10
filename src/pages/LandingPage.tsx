import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">ESSÊNCIA COSMÉTICOS</h1>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg"
        >
          Acessar Sistema <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}

export default LandingPage;
