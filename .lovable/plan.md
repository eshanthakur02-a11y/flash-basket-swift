## Goal
Build an end-to-end support system: customers, shopkeepers, and delivery partners can file tickets; a new "Support Executive" role triages, replies, assigns, and resolves them. Admin gets analytics.

## Database (migration)

Add `support` to `app_role` enum.

New tables (all with GRANTs + RLS + updated_at trigger):
- `support_tickets` — id, ticket_number (auto), user_id, role_at_creation (customer/shopkeeper/delivery), title, description, category (enum), order_id (nullable), shop_id (nullable), partner_id (nullable), status (open/assigned/in_progress/resolved/closed), priority (low/normal/high), assigned_to (support agent user_id, nullable), resolved_at, closed_at, first_response_at, timestamps
- `support_messages` — id, ticket_id, sender_id, sender_role, body, is_internal_note (bool), created_at
- `ticket_attachments` — id, ticket_id, message_id (nullable), uploaded_by, file_url, file_name, mime, created_at
- `ticket_assignments` — id, ticket_id, assigned_to, assigned_by, assigned_at, unassigned_at (history log)
- `support_agents` — user_id PK, display_name, is_active, max_concurrent, total_resolved, avg_resolution_minutes (computed cache, optional)

Enums:
- `ticket_category`: order_issue, payment_issue, refund_issue, delivery_issue, product_issue, shop_issue, account_issue, technical_issue
- `ticket_status`: open, assigned, in_progress, resolved, closed
- `ticket_priority`: low, normal, high

RLS:
- Tickets: creator can SELECT/INSERT their own; support+admin can SELECT/UPDATE all. No internal notes visible to non-support.
- Messages: ticket creator can see non-internal + insert; support/admin full access.
- Attachments: same scoping as parent ticket.
- Assignments: support/admin only.
- Agents: support/admin select; admin manage.

Security-definer functions:
- `create_support_ticket(...)` → returns id, sets ticket_number, notifies all support agents.
- `assign_ticket(_ticket_id, _agent_id)` → admin/support; writes assignment row, sets status='assigned', notifies agent and creator.
- `update_ticket_status(_ticket_id, _status)` → support/admin; sets resolved_at/closed_at; notifies creator.
- `post_ticket_message(_ticket_id, body, is_internal)` → both sides; first non-internal support reply sets first_response_at; notifies counterparty.
- `admin_support_stats()` → totals (open/resolved), avg resolution minutes, per-agent perf.

Storage bucket: `support-attachments` (private) + RLS policies for ticket participants/support/admin.

Realtime: ADD TABLE for `support_tickets` and `support_messages`.

## Frontend

New shared component:
- `src/components/SupportTicketForm.tsx` — modal/page with fields (title, desc, category select, optional order_id select fetched from user's orders, image upload via ImageInput to support-attachments). Calls `create_support_ticket` RPC then uploads attachment.
- `src/components/SupportFab.tsx` — floating "Help & Support" button that opens the form. Mounted on customer/shopkeeper/delivery dashboards.

New routes:
- `src/routes/support.my-tickets.tsx` — for any signed-in user; lists own tickets, click to view thread.
- `src/routes/support.ticket.$id.tsx` — thread view; user sees public messages, can reply, see status.
- `src/routes/support.tsx` (layout) + `support.dashboard.tsx`, `support.tickets.tsx`, `support.tickets.$id.tsx`, `support.profile.tsx` — Support Executive area with `RoleShell role="admin"` sidebar variant and `requireRoles={["support"]}`.
  - Dashboard: counts, my assigned, unassigned queue.
  - Tickets list: filters (status, category, role), search, assign-to-me, click → detail.
  - Detail: complaint info + contextual panel:
    - Customer ticket → profile (name/phone), addresses, recent orders, current orders.
    - Shopkeeper ticket → shop, owner, products count, recent orders.
    - Delivery ticket → partner record, vehicle, assigned active orders.
    - Actions: Assign, Mark In Progress, Resolve, Close, Add internal note, Reply to user.
- `src/routes/admin.support.tsx` — Admin analytics: totals, open, resolved, avg resolution time, per-agent performance table; manage Support Executives (assign/revoke role, toggle active).

Nav updates:
- Customer/Shopkeeper/Delivery dashboards → add SupportFab + nav entry "Help".
- Add `SUPPORT_NAV` const & integrate into RoleShell.
- Admin sidebar → add "Support" link.
- `app.tsx` and `dashboard.tsx` redirects → include `support` role → `/support/dashboard`.

Realtime + notifications:
- Subscribe to `support_tickets` (assigned_to=user) and `support_messages` (ticket I own/assigned) for live updates in detail/list views.
- DB notifications inserted via existing `notify_user`/`notify_role` patterns; existing OneSignal pg_net trigger handles push.

## Out of scope (this pass)
- SLA timers, file types other than images, bulk operations, canned responses (can add later).

## Files

New:
- `supabase/migrations/<ts>_support_system.sql`
- `src/components/SupportTicketForm.tsx`, `src/components/SupportFab.tsx`
- `src/routes/support.tsx`, `support.dashboard.tsx`, `support.tickets.tsx`, `support.tickets.$id.tsx`, `support.profile.tsx`
- `src/routes/support.my-tickets.tsx`, `src/routes/support.ticket.$id.tsx`
- `src/routes/admin.support.tsx`

Edited:
- `src/routes/customer.home.tsx`, `shopkeeper.dashboard.tsx`, `delivery.dashboard.tsx` (mount SupportFab)
- `src/routes/admin.dashboard.tsx` (add Support link to ADMIN_NAV)
- `src/routes/app.tsx`, `src/routes/dashboard.tsx` (route `support` role)
- `src/hooks/useAuth.tsx` (extend Role type to include `support`)

After your approval I'll run the migration first, then write the UI in one batch.