import { CartItem } from '../types';

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((acc, item) => acc + (item.product.sale_price * item.quantity), 0);
};

export const calculateChange = (total: number, received: number): number => {
  return Math.max(0, received - total);
};

// Verificação simples para rodar no navegador sem dependências de servidor
export const validateManagerPassword = (password: string): boolean => {
  return password === "1234";
};
