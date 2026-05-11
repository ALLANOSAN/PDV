import type { CartItem } from "../types";
import { supabase } from "./supabase";

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (acc, item) => acc + (item.product.sale_price * item.quantity),
    0,
  );
};

export const calculateChange = (total: number, received: number): number => {
  return Math.max(0, received - total);
};

// Validação no servidor (RPC) - mais seguro que client-side
export const validateManagerPassword = async (password: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('validate_manager_password', {
    p_password: password,
  });
  
  if (error) {
    console.error('Erro ao validar senha:', error);
    return false;
  }
  
  return data ?? false;
};

// Reexporta CartItem para facilitar importação direta deste módulo
export type { CartItem } from "../types";
