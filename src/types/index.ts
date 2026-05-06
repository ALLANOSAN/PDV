export interface Product {
  id: string;
  user_id: string;
  name: string;
  sku: string | null;
  unit: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  total_amount: number;
  payment_method: 'cash' | 'cielo' | 'mercado_pago' | 'sumup';
  status: 'completed' | 'pending' | 'canceled';
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  // Join fields
  product?: Product;
}

export interface CashOperation {
  id: string;
  user_id: string;
  type: 'open' | 'close' | 'sangria' | 'reforco';
  amount: number;
  initial_balance?: number;
  final_balance?: number;
  reason?: string;
  created_at: string;
}
