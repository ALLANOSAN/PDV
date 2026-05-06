# Plano de Implementação: PDV Local Pro

Este documento detalha a estratégia de desenvolvimento para o sistema de Frente de Caixa (PDV) local, utilizando React, Vite, Tailwind CSS e Supabase.

## 📌 Visão Geral
Sistema de PDV otimizado para performance local, funcionando como um PWA, com gestão de estoque, vendas, caixa e integração de pagamentos.

## 🎯 Critérios de Sucesso
- Interface "Frente de Caixa" intuitiva e rápida.
- Sincronização em tempo real com Supabase.
- Gestão completa de abertura/fechamento de caixa e sangrias.
- Fluxo de pagamento funcional (simulado inicialmente).
- UI/UX memorável seguindo o estilo *Typographic Industrialist*.

## 🛠️ Tech Stack
- **Frontend:** React + Vite + TypeScript.
- **Styling:** Tailwind CSS + Shadcn/UI.
- **Backend/DB:** Supabase (Auth, PostgreSQL, RLS, Realtime).
- **Icons:** Lucide React.
- **Charts:** Recharts.
- **Animações:** Framer Motion.

## 📂 Estrutura de Arquivos Proposta
```text
src/
├── components/     # Componentes Shadcn/UI e customizados
├── hooks/          # Hooks para Supabase e lógica de PDV
├── lib/            # Configurações (supabaseClient, utils)
├── pages/          # Vendas, Estoque, Caixa, Dashboard, Login
├── types/          # Definições de TypeScript para DB e App
└── App.tsx         # Roteamento e Layout Principal
supabase/
└── migrations/     # Scripts SQL para tabelas e RLS
```

## 📝 Breakdown de Tarefas

### Fase 1: Fundação & Banco de Dados (LOCAL)
- [ ] **T1: Setup Supabase Local** (Agent: `devops-engineer`)
  - Configurar `supabase/config.toml`.
  - Preparar script de inicialização `setup-local.sh`.
  - Criar migração inicial SQL em `supabase/migrations/`.
  - **Verify:** `supabase start` rodando localmente via Docker.
- [ ] **T2: Configuração do Projeto Vite** (Agent: `frontend-specialist`)
  - Instalar Tailwind, Shadcn/UI e dependências base.
  - Configurar `supabaseClient.ts` apontando para local (localhost:54321).
  - **Verify:** Frontend carregando com sucesso.

### Fase 2: Autenticação & Landing Page
- [ ] **T3: Landing Page "Typographic Industrialist"** (Agent: `frontend-specialist`)
  - Implementar Hero massivo e design profissional.
  - **Verify:** Auditoria de UX (`ux_audit.py`).
- [ ] **T4: Sistema de Auth** (Agent: `security-auditor`)
  - Páginas de Login e Registro com Supabase Auth.
  - Proteção de rotas.
  - **Verify:** Fluxo de login completo com feedback visual (Toasts).

### Fase 3: Core do PDV (Vendas & Caixa)
- [ ] **T5: Dashboard Principal** (Agent: `frontend-specialist`)
  - Sidebar e cards de resumo.
  - **Verify:** Verificação visual de responsividade.
- [ ] **T6: Frente de Caixa (Vendas)** (Agent: `frontend-specialist`)
  - Carrinho, busca de produtos, totalizador.
  - **Verify:** Teste manual de adição/remoção de itens.
- [ ] **T7: Gestão de Caixa** (Agent: `backend-specialist`)
  - Fluxo de abertura, fechamento e sangria.
  - **Verify:** Registros na tabela `cash_operations`.

### Fase 4: Estoque & Pagamentos
- [ ] **T8: Gestão de Estoque** (Agent: `frontend-specialist`)
  - Tabela CRUD de produtos.
  - **Verify:** Atualização em tempo real da `stock_quantity`.
- [ ] **T9: Simulação de Pagamentos** (Agent: `backend-specialist`)
  - Integração mock com Cielo/MercadoPago/SumUp via Edge Functions simuladas.
  - **Verify:** Mudança de status da venda para 'completed'.

## 🏁 Phase X: Verificação Final
- [ ] Lint & Type Check: `npm run lint`
- [ ] Security Scan: `python .agent/scripts/checklist.py .`
- [ ] Build Test: `npm run build`
- [ ] UX Audit: `python .agent/skills/frontend-design/scripts/ux_audit.py .`

---
## ✅ IMPLEMENTATION START
Plan created and ready for execution.
