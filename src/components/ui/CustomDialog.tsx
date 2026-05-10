import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className={`p-4 rounded-2xl ${
            type === 'confirm' ? 'bg-amber-50 text-amber-500' : 
            type === 'prompt' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
          }`}>
            {type === 'confirm' && <HelpCircle size={32} />}
            {type === 'prompt' && <AlertCircle size={32} />}
            {type === 'alert' && <CheckCircle2 size={32} />}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{message}</p>
          </div>
        </div>

        {type === 'prompt' && (
          <input 
            autoFocus
            type="password"
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold mb-6 focus:border-indigo-500 outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onConfirm(inputValue)}
          />
        )}

        <div className="flex gap-3">
          {(type === 'confirm' || type === 'prompt') && (
            <button 
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase text-xs tracking-widest"
            >
              Cancelar
            </button>
          )}
          <button 
            onClick={() => onConfirm(type === 'prompt' ? inputValue : undefined)}
            className="flex-[2] bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-widest hover:opacity-90 transition-all uppercase"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
