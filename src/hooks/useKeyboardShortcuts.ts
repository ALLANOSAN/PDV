import { useEffect, useRef } from 'react';

export const useKeyboardShortcuts = (actions: {
  onF1: () => void;
  onF2: () => void;
  onF3: () => void;
  onF4: () => void;
  onEsc: () => void;
}) => {
  // ITEM 18: Usar Ref para evitar Stale Closures (Bug do PDF)
  const actionsRef = useRef(actions);
  
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { onF1, onF2, onF3, onF4, onEsc } = actionsRef.current;
      
      if (e.key === 'F1') { e.preventDefault(); onF1(); }
      else if (e.key === 'F2') { e.preventDefault(); onF2(); }
      else if (e.key === 'F3') { e.preventDefault(); onF3(); }
      else if (e.key === 'F4') { e.preventDefault(); onF4(); }
      else if (e.key === 'Escape') { e.preventDefault(); onEsc(); }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Monitora o teclado uma única vez
};
