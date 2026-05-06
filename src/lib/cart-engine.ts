import { CartItem } from '../types';
import * as argon2 from 'argon2';

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((acc, item) => acc + (item.product.sale_price * item.quantity), 0);
};

export const calculateChange = (total: number, received: number): number => {
  return Math.max(0, received - total);
};

// Verifica a senha contra o hash armazenado
export const validateManagerPassword = async (password: string, storedHash: string): Promise<boolean> => {
  try {
    return await argon2.verify(storedHash, password);
  } catch {
    return false;
  }
};
