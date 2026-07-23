# Multi-Shop Delivery — Phase 2 Rollout Plan

Sequenced to minimize risk. After every phase I'll pause for you to test before moving on. Existing single-shop orders keep working unchanged throughout.

## Phase A — Delivery Core (highest risk, ship first)

Everything the rider and customer experience end-to-end for a multi-shop order.

1. **Consolidated delivery task** — when all child orders reach `ready`, create ONE task on the parent, one rider assignment. RPC: `create_consolidated_delivery_task(parent_id)`, idempotent (unique index on `parent_order_id` in delivery tasks).
2. **Smart rider assignment** — new RPC `rank_riders_for_parent(parent_id, limit)` scoring by distance to first pickup, availability, active load, rating, ETA. Notify top N; expand radius on no-accept after 60s. Replaces broadcast.
3. **Smart pickup sequencing** — call Google Routes `computeRoutes` with waypoints on task creation, store `pickup_sequence jsonb` on parent. Recompute on rider location update if traffic delta > 20%.
4. **Redesigned rider screen** (`/delivery/task/$id`) — Multi-shop badge, parent order #, shops/products/earnings/distance/ETA header, ordered pickup list (Shop A → B → C) with per-shop products, status, "Navigate" (deep-link Google Maps), "Pickup Complete" (calls `rider_verify_pickup` with OTP). After all pickups → "Proceed to Customer" CTA. Falls back to existing single-shop UI when `is_parent = false`.
5. **Live ETA** — rider posts GPS to `partner_update_location` every 20s; RPC `compute_live_eta(parent_id)` returns `{to_next_pickup, to_customer}`; customer/admin/rider surfaces subscribe via existing Realtime.
6. **Reservation auto-release** — pg_cron every minute → `release_expired_reservations()` (already exists, wire the schedule).
7. **Idempotency guards** — unique constraints on `(parent_order_id)` in delivery tasks, `(order_id, shop_id, event_type)` in pickup_events, `(order_id, user_id, kind)` in notifications dispatch. Wrap RPC bodies in advisory locks keyed by parent_order_id.

**Checkpoint A**: You test a 2-shop order end-to-end (customer → both shopkeepers accept → rider picks both → deliver). I fix any bugs before Phase B.

## Phase B — Customer Resolution + Stability

1. **Unavailable items UI** — when `place_multi_shop_order` returns `routing_status = 'partial_no_replacement'`, customer sees a modal listing unavailable lines with three actions per item: Remove / Replace (opens similar-product picker via `list_customer_products` filtered by category) / Cancel entire order. RPC `resolve_unavailable_items(parent_id, actions[])` recomputes totals + reservations.
2. **Duplicate protection audit** — verify guards from A.7, add missing ones (parent order create uses `md5(user_id||cart_snapshot||minute)` idempotency key), notification dispatch de-dupes on `(user_id, order_id, kind)` within 60s.
3. **Perf pass** — remove polling on routes that already have Realtime (finish the sweep from the earlier stability phase), memoize heavy renders in rider/shopkeeper dashboards, dedupe overlapping queries.
4. **Stability sweep** — Playwright smoke across all role dashboards, fix any frozen buttons / blank routes.

**Checkpoint B**: You verify customer resolution flow + full app feels smooth.

## Phase C — Admin Visibility

1. **Admin timeline UI** — new route `/admin/orders/$id/timeline` reading `admin_order_timeline(parent_id)`, vertical event feed (parent created → reserved → shop selection → each child accept/reject → replacement → ready → rider assigned → each pickup → delivered). Filter by parent order / shop / rider / date.
2. **Multi-shop analytics** — extend `/admin/earnings` (or new `/admin/analytics/multi-shop`) with: single vs multi-shop volume, avg shop acceptance time, avg rider assignment time, pickup duration, delivery duration, shop rejection %, rider cancel %, multi-shop success %. Charts via Recharts, date filter, CSV export.

**Checkpoint C**: You review admin visibility.

## Phase D — QA & Hardening

Playwright end-to-end scenarios: single-shop happy path, 3-shop happy path, 1-shop-rejects-with-replacement, 1-shop-rejects-no-replacement (→ customer resolution), rider cancel after pickup, OTP mismatch. Fix everything found. Final production-readiness report.

## What I will NOT do

- Rewrite the existing single-shop `place_order` / `partner_*` flow. Multi-shop is additive; old orders keep their path.
- Ship placeholder UI. Every screen listed above is fully wired or not shipped in that phase.

## Approval needed

Reply "go" and I'll start Phase A immediately. If you want to reorder anything (e.g. admin timeline before rider UX), say so now.
