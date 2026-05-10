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
      
      if (e.key === 'F1') { e.preventDefault(); onF1(); }
      else if (e.key === 'F2') { e.preventDefault(); onF2(); }
      else if (e.key === 'F3') { e.preventDefault(); onF3(); }
      else if (e.key === 'F4') { e.preventDefault(); onF4(); }
      else if (e.key === 'F5') { e.preventDefault(); onF5(); }
      else if (e.key === 'F6') { e.preventDefault(); onF6(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); onPlus(); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); onMinus(); }
      else if (e.key === 'Escape') { e.preventDefault(); onEsc(); }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
