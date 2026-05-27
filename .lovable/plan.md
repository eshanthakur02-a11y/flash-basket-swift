
## What we're building

A polished frontend-only prototype layered on the existing FlashBasket design. Four connected dashboards driven by one shared demo state in `localStorage`. The hero workflow is the Chocolate Truffle Birthday Cake order #FB10234 flowing across all four roles.

NO real backend. NO Supabase calls. NO Razorpay. Everything is React state + localStorage. The existing Supabase-backed routes (`/products`, `/cart`, `/dashboard`, etc.) stay as-is for now; the new demo platform lives under `/customer/*`, `/shopkeeper/*`, `/delivery/*`, `/admin/*` and a new `/login`, `/signup`.

## Architecture

```text
src/lib/demo/
  types.ts        — Order, Status, Role, Notification, User types
  seed.ts         — 3 customers, 3 stores, 3 partners, 30 products,
                    coupons, complaints, history, FB10234 seed
  store.ts        — useDemo() Zustand-like hook backed by localStorage:
                    role, currentUserId, primaryOrder, orders[],
                    notifications, advanceOrder(), rejectOrder(),
                    resetScenario(), addToCart(), placeOrder(), etc.

src/components/demo/
  DemoShell.tsx        — role-aware layout (sidebar desktop, bottom-nav mobile)
  RoleSwitcher.tsx     — "Demo Mode" dropdown in header
  NotificationBell.tsx — drawer with unread badge, role-filtered
  OrderTimeline.tsx    — reusable horizontal/vertical timeline with role labels
  StatusBadge.tsx, ActionConfirmModal.tsx, EmptyState.tsx
```

## Routes (file-based, dot syntax)

Public: `login.tsx`, `signup.tsx`, `offers.tsx`, `help.tsx`

Layout routes with `<Outlet />`:
- `customer.tsx`, `shopkeeper.tsx`, `delivery.tsx` — REPLACE current `admin.tsx` with new admin layout

Customer (13): home, stores, store.$id, shop, product.$id, cart, checkout, orders, orders.$id, wishlist, profile, notifications, help

Shopkeeper (9): dashboard, orders, orders.$id, products, inventory, earnings, reviews, settings, notifications

Delivery (7): dashboard, available-orders, task.$id, earnings, history, profile, notifications

Admin (12): dashboard, orders, orders.$id, customers, shops, delivery-partners, products, complaints, promotions, reports, settings, notifications

That's ~46 new route files. To stay efficient I'll fully build the core-workflow pages (customer home/product/cart/checkout/orders.$id, shopkeeper dashboard+orders.$id, delivery dashboard+task.$id, admin dashboard+orders.$id) and keep secondary pages compact but real (lists from seed data, working filters, working modals — not lorem ipsum).

## Shared workflow (the spine)

`primaryOrder.status` cycles through 11 states. Each role has buttons that call `advanceOrder(nextStatus)` which:
1. mutates the order in localStorage
2. appends a timeline event with timestamp
3. fans out notifications to the 4 roles
4. triggers a toast

Customer place order → shopkeeper accept → preparing → ready → delivery available → accept → at store → picked up → out for delivery → OTP 4821 → delivered. Reject/cancel flows update status to `rejected_by_shop` / `cancelled_by_customer` / `finding_another_partner`.

## Existing styling preserved

Cream bg, lime primary, charcoal text, rounded cards, glass header, soft shadows — all already in `src/styles.css`. Reuse `Header`/`Logo`/`ProductCard` styles. New `DemoShell` uses the same tokens.

## Out of scope (explicit)

- No real auth — `/login` and `/signup` only set demo role+user in localStorage
- No real payments — checkout shows UPI/Card/Wallet/COD UI then calls `placeOrder()`
- No real maps — task page shows two pin cards on a styled placeholder
- Existing Supabase routes (`/`, `/products`, `/cart`, `/dashboard`, `/auth`, `/admin`) remain functional. The new login button + demo flow lives alongside.

## What user sees after build

1. Click "Demo Login" → land on `/customer/home` as Aarav
2. Customize cake → cart → checkout → place order
3. Use RoleSwitcher in header → "View as Shopkeeper" → see #FB10234 incoming card → Accept → Start Preparing → Ready for Pickup
4. Switch to Delivery → see available task → Accept → step through pickup → enter OTP 4821 → Delivered
5. Switch to Admin → see KPIs update, full activity log, can Reset Scenario

Approve and I'll build it.
