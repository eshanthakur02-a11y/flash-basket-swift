import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { rupees } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ADMIN_NAV } from "./admin.dashboard";

export const Route = createFileRoute("/admin/orders")({ component: Page });

function Page() {
  const q = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("id, order_number, status, total, placed_at, user_id, shop_id").order("placed_at", { ascending: false }).limit(100)).data ?? [],
    refetchInterval: 10000,
  });
  return (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-4 md:p-6">
        <h1 className="font-display text-3xl font-extrabold">All orders</h1>
        <div className="mt-5 rounded-2xl border border-border bg-card divide-y divide-border">
          {(q.data ?? []).map(o => (
            <Link key={o.id} to="/admin/orders/$id" params={{ id: o.id }} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/40 text-sm">
              <span className="font-semibold">{o.order_number}</span>
              <span className="text-xs uppercase rounded-full bg-secondary px-2 py-1 font-bold">{o.status.replace(/_/g, " ")}</span>
              <span className="font-bold">{rupees(o.total)}</span>
            </Link>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}
