import type { CartItem } from "../types";

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (acc, item) => acc + (item.product.sale_price * item.quantity),
    0,
  );
};

export const calculateChange = (total: number, received: number): number => {
  return Math.max(0, received - total);
};

// Verificação usando variável de ambiente
export const validateManagerPassword = (password: string): boolean => {
  const managerPass = import.meta.env.VITE_MANAGER_PASSWORD || "1234";
  return password === managerPass;
};

// Reexporta CartItem para facilitar importação direta deste módulo
export type { CartItem } from "../types";
