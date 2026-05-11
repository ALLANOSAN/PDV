import { ArrowRight, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-all"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">ESSÊNCIA COSMÉTICOS</h1>
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
