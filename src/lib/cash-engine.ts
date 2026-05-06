import { CashOperation } from '../types';

/**
 * Motor de lógica para gestão de caixa
 * Traduzido da lógica C# de CashRegisterService
 */

export const getMovementSign = (type: CashOperation['type']): number => {
  switch (type) {
    case 'open': return 1;
    case 'reforco': return 1;
    case 'sangria': return -1;
    case 'close': return 0; // Fechamento é balanço final
    default: return 0;
  }
};

export const calculateCurrentBalance = (operations: CashOperation[]): number => {
  return operations.reduce((acc, op) => {
    // Se for abertura, inicia com o valor
    if (op.type === 'open') return op.amount;
    
    // Calcula o valor assinado
    const sign = getMovementSign(op.type);
    return acc + (op.amount * sign);
  }, 0);
};

export const canPerformOperation = (operations: CashOperation[]): boolean => {
  const lastOp = operations[0];
  return !!lastOp && lastOp.type !== 'close';
};
