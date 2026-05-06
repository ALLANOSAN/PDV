-- Migration: Initial Schema for PDV Local Pro

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    unit TEXT DEFAULT 'un',
    cost_price NUMERIC(12, 2) DEFAULT 0.00,
    sale_price NUMERIC(12, 2) DEFAULT 0.00,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT CHECK (payment_method IN ('cash', 'cielo', 'mercado_pago', 'sumup')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'canceled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sale Items Table
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cash Operations Table
CREATE TABLE IF NOT EXISTS public.cash_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('open', 'close', 'sangria', 'reforco')),
    amount NUMERIC(12, 2) DEFAULT 0.00,
    initial_balance NUMERIC(12, 2),
    final_balance NUMERIC(12, 2),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Payment Configs
CREATE TABLE IF NOT EXISTS public.payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('cielo', 'mercado_pago', 'sumup')),
    credentials JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- RLS (Row Level Security) Configuration
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_configs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only access their own products" ON public.products
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own sales" ON public.sales
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own sale items" ON public.sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales 
            WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only access their own cash operations" ON public.cash_operations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own payment configs" ON public.payment_configs
    FOR ALL USING (auth.uid() = user_id);
