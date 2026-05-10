import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mb-6">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Ops! Algo deu errado</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-md font-medium">
        Ocorreu um erro inesperado no sistema, mas não se preocupe, seus dados estão seguros.
        <br />
        <span className="text-xs font-mono opacity-50 block mt-4 bg-slate-200 dark:bg-slate-800 p-2 rounded-lg truncate w-full">
            {error.message}
        </span>
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
      >
        <RefreshCw size={20} /> Tentar Recarregar
      </button>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
}
