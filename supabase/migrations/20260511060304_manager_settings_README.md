# ⚠️ Passo obrigatório após rodar esta migration

A migration 20260511060304_create_manager_settings_table.sql cria a tabela manager_settings, mas NÃO insere senha inicial.

Para o sistema funcionar corretamente, execute este SQL no Supabase SQL Editor (ou psql), trocando SUA_SENHA_AQUI pela senha real desejada:

```sql
INSERT INTO public.manager_settings (password_hash)
VALUES (crypt('SUA_SENHA_AQUI', gen_salt('bf')));
```

Para trocar a senha depois:

```sql
UPDATE public.manager_settings
SET password_hash = crypt('NOVA_SENHA', gen_salt('bf'));
```

Se não inserir a senha, toda validação de senha de gerente irá falhar.
