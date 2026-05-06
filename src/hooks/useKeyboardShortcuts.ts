import { useEffect } from 'react';

export const useKeyboardShortcuts = (actions: {
  onF1: () => void; // Focar busca
  onF2: () => void; // Finalizar em Dinheiro
  onF3: () => void; // Gestão de Caixa
  onF4: () => void; // Cancelar Venda Completa
  onEsc: () => void; // Limpar carrinho
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); actions.onF1(); }
      else if (e.key === 'F2') { e.preventDefault(); actions.onF2(); }
      else if (e.key === 'F3') { e.preventDefault(); actions.onF3(); }
      else if (e.key === 'F4') { e.preventDefault(); actions.onF4(); }
      else if (e.key === 'Escape') { e.preventDefault(); actions.onEsc(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
};
