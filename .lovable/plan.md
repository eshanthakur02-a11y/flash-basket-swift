## Scope

### 1. Mobile sidebar UX (RoleShell)
- shadcn `Sheet` already supports tap-outside + ESC. Add explicit swipe-to-close (drag-left to dismiss) using a small touch handler on `SheetContent`.
- Remove the separate mobile top bar that holds the hamburger and instead inject the hamburger as the `leading` slot of `RoleHeader`. Expose a `MobileMenuTrigger` component that consumers (`shopkeeper.tsx`, `admin.tsx`) can pass into `RoleHeader.leading`.

### 2. Delivery Management — Shopkeeper
New page `src/routes/shopkeeper.delivery.tsx`:
- **Assign / re-assign delivery partner**: list packed orders for the shop with current partner; allow manual re-assignment via a new RPC `shop_assign_partner(_order_id, _partner_id)` and "Auto re-assign nearest" via existing `find_nearest_partner_for_order`.
- **Track delivery status**: live list of `out_for_delivery` orders with partner name, phone, and last GPS coordinate; auto-refresh every 8s.
- **Delivery performance**: per-partner stats (orders today, avg time placed→delivered, on-time %) via new RPC `shop_partner_performance(_shop_id)`.
- Add nav entry under Shopkeeper.

### 3. Delivery Management — Admin
New page `src/routes/admin.delivery.tsx` (replaces the stub `admin.delivery-partners.tsx` content):
- Global view of all `out_for_delivery` orders with partner + shop + ETA.
- Partner roster with online status, current order, today's deliveries, rating.
- Performance table: orders completed (today / 7d / 30d), avg delivery time, on-time %, attendance hours today.
- Manual reassignment via `admin_reassign_partner(_order_id, _partner_id)` RPC.

### 4. Attendance for delivery partners
- New table `partner_attendance` (partner_id, check_in_at, check_out_at, notes).
- RPCs: `partner_check_in()`, `partner_check_out()`, `partner_today_hours(_partner_id)`.
- UI on `delivery.dashboard.tsx`: Check In / Check Out buttons + today's hours + last 7 days list.
- Going online without a check-in prompts to check in first (soft prompt, doesn't block).

## Technical notes
- New migration: `partner_attendance` table with RLS (partner sees own; admin/shop-owner-of-current-order see read); new RPCs above (SECURITY DEFINER, GRANT EXECUTE to authenticated, REVOKE from anon).
- All "performance" stats are computed in SQL functions to avoid client-side joins.
- Reuse existing notification system to alert partner on manual reassignment.

## Out of scope (ask if needed)
- Geofencing for auto check-in/out.
- Payroll/payout calculation from working hours.
- SMS notifications.
