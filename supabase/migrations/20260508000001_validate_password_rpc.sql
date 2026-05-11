-- Função para validar senha de gerente no servidor
-- A senha deve ser configurada no Supabase Dashboard em Settings > Auth > Confirm
-- ou pode ser alterada diretamente aqui
CREATE OR REPLACE FUNCTION public.validate_manager_password(p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_manager_pass TEXT := '1234'; -- Altere aqui a senha padrão
BEGIN
    RETURN p_password = v_manager_pass;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;