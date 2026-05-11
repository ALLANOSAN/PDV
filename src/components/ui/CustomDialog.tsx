import React from 'react';
import { CheckCircle2, HelpCircle, X, ShieldCheck } from 'lucide-react';

type DialogType = 'confirm' | 'alert' | 'prompt';

interface CustomDialogProps {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  defaultValue?: string;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({ 
  isOpen, type, title, message, onConfirm, onCancel, defaultValue = '' 
}) => {
  const [inputValue, setInputValue] = React.useState(defaultValue);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />
      
      <div className="relative w-full max-w-sm overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-2xl ${
              type === 'confirm' ? 'bg-amber-100 text-amber-600' : 
              type === 'prompt' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {type === 'confirm' && <HelpCircle size={32} />}
              {type === 'prompt' && <ShieldCheck size={32} />}
              {type === 'alert' && <CheckCircle2 size={32} />}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{message}</p>
            </div>
          </div>

          {type === 'prompt' && (
            <div className="mt-8">
              <input 
                autoFocus
                type="password"
                placeholder="••••"
                className="w-full text-center bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-4 text-2xl font-mono tracking-widest outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onConfirm(inputValue)}
              />
            </div>
          )}
        </div>

        <div className="px-8 pb-8 flex gap-3">
          {type !== 'alert' && (
            <button 
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs tracking-widest uppercase"
            >
              Cancelar
            </button>
          )}
          <button 
            onClick={() => onConfirm(type === 'prompt' ? inputValue : undefined)}
            className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95 uppercase"
          >
            {type === 'confirm' ? 'Confirmar' : 'Validar'}
          </button>
        </div>
      </div>
    </div>
  );
};
