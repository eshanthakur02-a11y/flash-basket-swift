# FlashBasket Stability & Performance Pass

## Scope

No redesign. No feature removal. Only correctness, stability, performance.

The request lists 12 areas. I'll tackle them in priority order and stop for your review after each phase so we don't spend a huge amount on speculative changes.

## Phase 1 — High-signal bug hunt (do first)

Concrete, reproducible issues I can find and fix without guessing.

1. **"No Shop Assigned" false positives**
   - Re-audit `find_nearest_shop_for_order`, `find_best_shop_for_cart`, `list_eligible_shops_for_cart`, `place_order`, and the recently-fixed reject loop.
   - Verify: pincode gate, `owner_id IS NOT NULL`, `is_open`, `service_radius_km`, stock ≥ qty, and that `rejected_shop_ids` isn't being fed with duplicates or stale UUIDs.
   - Add a `debug_shop_routing(_order_id)` RPC that returns per-shop pass/fail reasons for admins.

2. **Realtime & subscription leaks**
   - Grep every `supabase.channel(...)` — confirm each is inside `useEffect` with cleanup. Fix any that subscribe at component scope (per Cloud Realtime rules; leaks cause reconnection loops → freezes + billing).

3. **Loading states that can hang**
   - Any `useQuery` whose `enabled` gate can leave the UI blank (no skeleton, no empty state). Add skeleton + empty + error+retry to the top-traffic screens: customer home, cart, checkout, orders, shopkeeper dashboard/orders, delivery available-orders/task, admin orders.

4. **JWT-expired 401 storm (already visible in network logs)**
   - Current `onAuthStateChange` handling may not be filtering `TOKEN_REFRESHED` / `INITIAL_SESSION`, causing bulk refetches against a cleared session → 401s. Audit `__root.tsx` and `useAuth`, apply the documented filter (identity transitions only).

5. **Router-level correctness**
   - Verify each `createFileRoute` string matches its filename (blank pages on refresh usually come from mismatch).
   - Confirm every layout route with children renders `<Outlet />`.
   - Confirm no `beforeLoad`-gated protected routes live at top level (must be under `_authenticated/`).

## Phase 2 — Performance

6. **Query defaults & caching**
   - Set sensible `staleTime` / `gcTime` on the shared `QueryClient` (e.g. 30s stale, 5min gc). Right now every mount refetches — this is a big reason the app "feels slow when first opened."
   - Add `defaultPreloadStaleTime: 0` if missing (per Query integration rules).

7. **Heavy home-page fan-out**
   - `customer.home.tsx` currently fires 3+ `list_customer_products` RPCs (featured/bestseller/price_asc) plus profile, address, cart, notifications on every render. Batch/parallelise via one RPC or a single loader; memoize hero images; lazy-load the 3D hero.

8. **Bundle / initial load**
   - Move `Hero3D`, Leaflet, Recharts, `react-three-fiber`, Framer Motion-only pages behind `React.lazy` + `<ClientOnly>` where possible. Verify no server route statically imports browser-only modules.

9. **Image optimization**
   - Confirm banner and product images use responsive sizes, `loading="lazy"` for non-LCP, and one `preload` link only for the LCP hero.

## Phase 3 — Cross-role integration

10. **End-to-end smoke via Playwright** (headless, in sandbox)
    - Customer places order → shopkeeper accepts → delivery partner claims → status updates propagate → admin sees it. Screenshot each step; only file bugs for regressions I can prove.

11. **RPC/response shape sanity**
    - Slow queries via `supabase--slow_queries`, add indexes where the top offenders warrant it.

## What I will NOT do without asking

- Rewrite any working screen for aesthetics.
- Change the auth architecture, roles table, or payment flow.
- Rip out the 3D hero, OneSignal, Google Maps, Razorpay, or Realtime.
- Ship "improvements" I can't measure or prove.

## Deliverables per phase

Each phase ends with:
- A short list of concrete fixes made (files + one-line summary each).
- Screenshots or log evidence for anything user-visible.
- A stop point where you can say "continue" or "skip the rest."

## Technical notes

- Migration(s) needed for: `debug_shop_routing` RPC, any missing indexes surfaced by `slow_queries`.
- Client changes: `src/router.tsx` (Query defaults), `src/routes/__root.tsx` (auth listener filter), targeted route files for skeleton/empty/error states, `React.lazy` splits.
- No changes to auto-generated files (`routeTree.gen.ts`, `supabase/client.ts`, `types.ts`).

## Ask

Approve this phased approach, or tell me to jump straight to a specific phase (e.g. "just fix No-Shop-Assigned and the freezes; skip the rest"). Given the breadth of the request, phased delivery keeps quality high and avoids collateral damage.
