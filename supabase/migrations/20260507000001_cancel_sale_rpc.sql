-- Função para cancelar venda e devolver estoque de forma atômica
CREATE OR REPLACE FUNCTION public.cancel_sale_with_stock(
    p_sale_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_item RECORD;
    v_sale RECORD;
BEGIN
    SELECT * INTO v_sale FROM public.sales WHERE id = p_sale_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Venda não encontrada.';
    END IF;

    IF v_sale.status = 'canceled' THEN
        RAISE EXCEPTION 'Venda já cancelada.';
    END IF;

    FOR v_item IN SELECT product_id, quantity FROM public.sale_items WHERE sale_id = p_sale_id LOOP
        UPDATE public.products
        SET stock_quantity = stock_quantity + v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    UPDATE public.sales
    SET status = 'canceled',
        updated_at = NOW()
    WHERE id = p_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
