-- Migration para atualizar os métodos de pagamento permitidos
-- Removemos os provedores específicos e usamos apenas 'cash' e 'card'

ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_payment_method_check;
ALTER TABLE public.sales ADD CONSTRAINT sales_payment_method_check CHECK (payment_method IN ('cash', 'card'));

-- Opcional: Remover a tabela de configurações de pagamento que não será mais usada
DROP TABLE IF EXISTS public.payment_configs;
