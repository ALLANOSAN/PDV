-- Função para processar venda e baixar estoque de forma atômica
CREATE OR REPLACE FUNCTION public.process_sale_with_stock(
    p_user_id UUID,
    p_total_amount NUMERIC,
    p_payment_method TEXT,
    p_items JSONB -- [{product_id, quantity, unit_price, subtotal}]
)
RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_item RECORD;
BEGIN
    -- 1. Cria a venda
    INSERT INTO public.sales (user_id, total_amount, payment_method, status)
    VALUES (p_user_id, p_total_amount, p_payment_method, 'completed')
    RETURNING id INTO v_sale_id;

    -- 2. Processa os itens e atualiza estoque
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER, unit_price NUMERIC, subtotal NUMERIC)
    LOOP
        -- Insere o item da venda
        INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (v_sale_id, v_item.product_id, v_item.quantity, v_item.unit_price, v_item.subtotal);

        -- Atualiza o estoque (o banco garante que não haverá saldo negativo se houver CONSTRAINT, mas aqui fazemos o decremento)
        UPDATE public.products 
        SET stock_quantity = stock_quantity - v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
