# PDV (Point of Sale)

## What This Is

A complete Point of Sale (PDV) web application for Brazilian small businesses. Features include sales/cashier operations, inventory management, cash flow tracking, and multi-provider payment integration (Cielo, MercadoPago, SumUp). Built with React + Supabase.

## Core Value

Small businesses can process sales, manage inventory, and track cash flow in one integrated system without expensive hardware.

## Requirements

### Validated

- ✓ React + Vite + TypeScript SPA — v1.0
- ✓ Supabase backend with PostgreSQL — v1.0
- ✓ Row Level Security (RLS) for data protection — v1.0
- ✓ User authentication with Supabase Auth — v1.0
- ✓ Landing page with Typographic Industrialist design — v1.0
- ✓ Dashboard with charts (Recharts) — v1.0
- ✓ Sales/Cashier page (Frente de Caixa) — v1.0
- ✓ Inventory management — v1.0
- ✓ Cash management operations — v1.0
- ✓ Payment integration: Cielo — v1.0
- ✓ Payment integration: MercadoPago — v1.0
- ✓ Payment integration: SumUp — v1.0
- ✓ Offline sync capability — v1.0
- ✓ PWA support with Core Web Vitals — v1.0

### Active

(No active requirements — project is built and deployed)

### Out of Scope

- Mobile native app — Web/PWA only for v1
- Multi-store/chain support — Single store only
- Advanced reporting — Basic dashboard only
- API for third-party integrations — Internal use only

## Context

**Stack:**
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Shadcn/UI, Recharts, Framer Motion, TanStack Query
- Backend: Supabase (PostgreSQL, Auth, Edge Functions)
- Deployment: Lovable (pdvlocalpro.lovable.app)

**Database Schema:**
- users: Authentication and user profiles
- products: Inventory items with pricing
- sales: Transaction records
- sale_items: Line items per sale
- cash_operations: Cash flow (open/close drawer, withdrawals)
- payment_configs: Payment provider settings

**Security:**
- Row Level Security (RLS) enabled on all tables
- User-based row access policies

## Constraints

- **Platform**: Web application (PWA-capable)
- **Target Users**: Brazilian small business owners
- **Payment**: Card payments only (Cielo, MercadoPago, SumUp)
- **Offline**: Basic sync for connectivity drops

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase over custom backend | Fast development, built-in auth, PostgreSQL, RLS | ✓ Good |
| Lovable deployment | Zero-config, automatic HTTPS, good DX | ✓ Good |
| PWA over native mobile | Lower cost, cross-platform, faster iteration | ✓ Good |
| Multiple payment providers | Brazilian market requires variety (Cielo dominant) | ✓ Good |

---
*Last updated: 2026-05-10 after initialization*