-- Migration: Fix permissions and tighten security
-- This migration revokes public access to tables that should only be accessible by authenticated users.

-- Revoke all from anon role (public)
REVOKE ALL ON TABLE public.products FROM anon;
REVOKE ALL ON TABLE public.sales FROM anon;
REVOKE ALL ON TABLE public.sale_items FROM anon;
REVOKE ALL ON TABLE public.cash_operations FROM anon;
REVOKE ALL ON TABLE public.payment_configs FROM anon;

-- Ensure authenticated role has necessary permissions (RLS will handle data isolation)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sale_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cash_operations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.payment_configs TO authenticated;

-- Revoke access to the GraphQL schema for the anon role if it exists
-- This is a common pattern to hide the API structure from unauthenticated users
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'graphql') THEN
        EXECUTE 'REVOKE USAGE ON SCHEMA graphql FROM anon';
    END IF;
END $$;
