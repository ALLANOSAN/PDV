import { useEffect, useRef } from 'react';

export const useKeyboardShortcuts = (actions: {
  onF1: () => void;
  onF2: () => void;
  onF3: () => void;
  onF4: () => void;
  onF5: () => void;
  onF6: () => void;
  onPlus: () => void;
  onMinus: () => void;
  onEsc: () => void;
}) => {
  const actionsRef = useRef(actions);
  
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { onF1, onF2, onF3, onF4, onF5, onF6, onPlus, onMinus, onEsc } = actionsRef.current;
      
      switch(e.key) {
        case 'F1': e.preventDefault(); onF1(); break;
        case 'F2': e.preventDefault(); onF2(); break;
        case 'F3': e.preventDefault(); onF3(); break; // Caixa (Cashier)
        case 'F4': e.preventDefault(); onF4(); break; // Histórico (Sales History)
        case 'F5': e.preventDefault(); onF5(); break; // Sangria/Reforço (Cashier Action)
        case 'F6': e.preventDefault(); onF6(); break; // Log/Backup (ou custom)
        case '+': case '=': e.preventDefault(); onPlus(); break;
        case '-': case '_': e.preventDefault(); onMinus(); break;
        case 'Escape': e.preventDefault(); onEsc(); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
