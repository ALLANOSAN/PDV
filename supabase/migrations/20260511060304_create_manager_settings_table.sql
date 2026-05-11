-- Criar tabela privada de configurações de gerente
CREATE TABLE IF NOT EXISTS public.manager_settings (
    id SERIAL PRIMARY KEY,
    password_hash TEXT NOT NULL
);

-- Ativar RLS
ALTER TABLE public.manager_settings ENABLE ROW LEVEL SECURITY;

-- Política para que NINGUÉM possa ler essa tabela publicamente
-- (A função RPC SECURITY DEFINER rodará com privilégios de administrador)
DROP POLICY IF EXISTS "No access" ON public.manager_settings;
CREATE POLICY "No access" ON public.manager_settings
    FOR SELECT USING (FALSE);

-- Garantir extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função RPC para validar senha
CREATE OR REPLACE FUNCTION public.validate_manager_password(p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_hash TEXT;
BEGIN
    -- Busca o hash
    SELECT password_hash INTO v_hash FROM public.manager_settings LIMIT 1;
    
    -- Verifica se hash existe e compara
    RETURN v_hash IS NOT NULL AND v_hash = crypt(p_password, v_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
