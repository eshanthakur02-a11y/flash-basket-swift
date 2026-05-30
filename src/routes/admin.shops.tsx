import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";

export const Route = createFileRoute("/admin/shops")({ component: Page });

function Page() {
  const q = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => (await supabase.from("shops").select("*").order("name")).data ?? [],
  });
  return (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-4 md:p-6">
        <h1 className="font-display text-3xl font-extrabold">Shops</h1>
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {(q.data ?? []).map(s => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.address}, {s.city}</div>
              <div className="text-xs mt-1">Owner: {s.owner_id ?? "Unassigned"} • {s.is_open ? "Open" : "Closed"}</div>
              <div className="text-xs text-muted-foreground">{s.latitude}, {s.longitude} • radius {s.service_radius_km} km</div>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}
