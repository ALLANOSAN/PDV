# Roadmap: PDV

**Core Value:** Small businesses can process sales, manage inventory, and track cash flow in one integrated system without expensive hardware.

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1     | ✓      | 1/1   | 100%     |
| 2     | ✓      | 1/1   | 100%     |
| 3     | ✓      | 1/1   | 100%     |
| 4     | ✓      | 1/1   | 100%     |

---

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation | React + Supabase setup | REACT-01, AUTH-01 | 4 criteria |
| 2 | Core Sales | Sales and payment flow | SALES-01, PAY-01 | 5 criteria |
| 3 | Inventory | Product management | INV-01, INV-02 | 4 criteria |
| 4 | Polish | Dashboard and PWA | DASH-01, PWA-01 | 3 criteria |

---

### Phase 1: Foundation
**Goal:** Set up React app with Supabase backend and authentication

**Mode:** mvp

**Success Criteria:**
1. ✅ React + Vite app running at pdvlocalpro.lovable.app
2. ✅ Supabase project connected with PostgreSQL database
3. ✅ User signup/login with email/password working
4. ✅ Row Level Security policies protecting all tables

---

### Phase 2: Core Sales
**Goal:** Enable sales transactions with payment processing

**Success Criteria:**
1. ✅ Cashier page (Frente de Caixa) functional
2. ✅ Shopping cart with add/remove items
3. ✅ Payment flow integration with Cielo
4. ✅ Payment flow integration with MercadoPago
5. ✅ Payment flow integration with SumUp

---

### Phase 3: Inventory
**Goal:** Product management and inventory tracking

**Success Criteria:**
1. ✅ Product CRUD (create, read, update, delete)
2. ✅ Product search and filtering
3. ✅ Low stock indicators
4. ✅ Category organization

---

### Phase 4: Polish
**Goal:** Dashboard, offline support, and PWA

**Success Criteria:**
1. ✅ Dashboard with sales charts (Recharts)
2. ✅ Cash management (open/close drawer, withdrawals)
3. ✅ PWA installation support

---

## Completed Phases

All phases complete. Project is live at pdvlocalpro.lovable.app

---
*Last updated: 2026-05-10 after GSD initialization*