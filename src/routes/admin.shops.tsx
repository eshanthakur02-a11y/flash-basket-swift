import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
import { LeafletMap } from "@/components/maps/LeafletMap";

export const Route = createFileRoute("/admin/shops")({ component: Page });

function Page() {
  const q = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => (await supabase.from("shops").select("*").order("name")).data ?? [],
  });

  const shops = q.data ?? [];
  const valid = shops.filter((s: any) => s.latitude != null && s.longitude != null);
  const center: [number, number] = valid.length > 0
    ? [
        valid.reduce((a: number, s: any) => a + s.latitude, 0) / valid.length,
        valid.reduce((a: number, s: any) => a + s.longitude, 0) / valid.length,
      ]
    : [12.9716, 77.5946];

  return (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-4 md:p-6">
        <h1 className="font-display text-3xl font-extrabold">Shops</h1>
        {valid.length > 0 && (
          <div className="mt-5">
            <LeafletMap center={center} zoom={11} className="h-80 w-full rounded-2xl overflow-hidden border border-border">
              {(RL) => {
                const { Marker, Popup, Circle } = RL;
                return (
                  <>
                    {valid.map((s: any) => (
                      <div key={s.id}>
                        <Marker position={[s.latitude, s.longitude]}>
                          <Popup>
                            <div className="font-bold">{s.name}</div>
                            <div className="text-xs">{s.address}, {s.city}</div>
                            <div className="text-xs">Radius {s.service_radius_km} km • {s.is_open ? "Open" : "Closed"}</div>
                          </Popup>
                        </Marker>
                        <Circle
                          center={[s.latitude, s.longitude]}
                          radius={(s.service_radius_km ?? 8) * 1000}
                          pathOptions={{ color: "hsl(var(--primary))", weight: 1, fillOpacity: 0.05 }}
                        />
                      </div>
                    ))}
                  </>
                );
              }}
            </LeafletMap>
          </div>
        )}
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {shops.map((s: any) => (
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
