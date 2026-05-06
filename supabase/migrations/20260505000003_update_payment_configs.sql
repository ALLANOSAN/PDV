-- Atualizando tabela de configurações de pagamento para maior robustez
ALTER TABLE public.payment_configs 
ADD COLUMN IF NOT EXISTS terminal_type TEXT,
ADD COLUMN IF NOT EXISTS api_version TEXT DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN DEFAULT FALSE;

-- Adicionando índices para busca rápida nas configurações
CREATE INDEX IF NOT EXISTS idx_payment_configs_provider ON public.payment_configs(provider);
