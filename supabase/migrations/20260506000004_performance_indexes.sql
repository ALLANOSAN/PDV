-- 1. Performance: Índices compostos para busca rápida
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products (name, sku);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales (created_at);

-- 2. Performance: Habilitar query específica para evitar select *
-- O Supabase já faz isso, mas garantir que as RLS Policies não acessem colunas desnecessárias
-- Otimização sugerida: Manter as políticas atuais mas reforçar o uso de colunas explícitas no código.
