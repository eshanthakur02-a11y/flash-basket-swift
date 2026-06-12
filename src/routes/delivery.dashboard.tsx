import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LayoutDashboard, PackageOpen, History, Wallet, User, Check, MapPin } from "lucide-react";
import { rupees } from "@/lib/format";
import { RouteMap } from "@/components/maps/RouteMap";
import { MessageCustomerDialog } from "@/components/MessageCustomerDialog";



const NAV = [
  { to: "/delivery/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/delivery/available-orders", label: "Available", icon: PackageOpen },
  { to: "/delivery/history", label: "History", icon: History },
  { to: "/delivery/earnings", label: "Earnings", icon: Wallet },
  { to: "/delivery/profile", label: "Profile", icon: User },
];

export const Route = createFileRoute("/delivery/dashboard")({
  head: () => ({ meta: [{ title: "Delivery Dashboard — FlashBasket" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [partner, setPartner] = useState<any>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const watchRef = useRef<number | null>(null);

  const ensurePartner = async () => {
    if (!user) return null;
    const { data, error } = await supabase.from("delivery_partners").select("*").eq("user_id", user.id).maybeSingle();
    if (error) { console.error("load partner:", error); toast.error(error.message); return null; }
    if (data) {
      setPartner(data);
      if (data.current_lat && data.current_lng) setMyPos({ lat: data.current_lat, lng: data.current_lng });
      return data;
    }
    const { data: created, error: insErr } = await supabase
      .from("delivery_partners")
      .insert({ user_id: user.id, name: user.email ?? "Partner", is_online: false })
      .select()
      .single();
    if (insErr) { console.error("create partner:", insErr); toast.error(insErr.message); return null; }
    setPartner(created);
    return created;
  };

  useEffect(() => { ensurePartner(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  useEffect(() => {
    const ch = supabase
      .channel("delivery-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["my-deliveries"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  // Live geolocation broadcast while online
  useEffect(() => {
    if (!partner?.is_online || !navigator.geolocation) {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      return;
    }
    let lastPush = 0;
    let lastUiUpdate = 0;
    let lastLat = myPos?.lat ?? null;
    let lastLng = myPos?.lng ?? null;
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        const now = Date.now();
        // Throttle UI updates: only re-render if moved >~15m or 4s elapsed.
        const moved =
          lastLat == null || lastLng == null
            ? Infinity
            : Math.hypot(lat - lastLat, lng - lastLng) * 111000; // deg→m approx
        if (moved > 15 || now - lastUiUpdate > 4000) {
          lastUiUpdate = now;
          lastLat = lat; lastLng = lng;
          setMyPos({ lat, lng });
        }
        if (now - lastPush > 5000) {
          lastPush = now;
          await supabase.from("delivery_partners").update({ current_lat: lat, current_lng: lng }).eq("id", partner.id);
        }
      },
      (err) => console.warn("geolocation:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    };
  }, [partner?.is_online, partner?.id]);

  const myDeliveries = useQuery({
    queryKey: ["my-deliveries", partner?.id],
    queryFn: async () => {
      if (!partner) return [];
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, total, status, address, shop_id, delivery_lat, delivery_lng")
        .eq("partner_id", partner.id)
        .in("status", ["out_for_delivery"])
        .order("placed_at", { ascending: false });
      const list = orders ?? [];
      const shopIds = Array.from(new Set(list.map((o: any) => o.shop_id).filter(Boolean)));
      let shopMap: Record<string, any> = {};
      if (shopIds.length > 0) {
        const { data: shops } = await supabase.from("shops").select("id,name,latitude,longitude").in("id", shopIds);
        shopMap = Object.fromEntries((shops ?? []).map((s: any) => [s.id, s]));
      }
      return list.map((o: any) => ({ ...o, shop: shopMap[o.shop_id] }));
    },
    enabled: !!partner,
    refetchInterval: 8000,
  });

  const toggleOnline = async (v: boolean) => {
    let p = partner;
    if (!p?.id) {
      p = await ensurePartner();
      if (!p?.id) return;
    }
    const { error } = await supabase.from("delivery_partners").update({ is_online: v }).eq("id", p.id);
    if (error) toast.error(error.message);
    else setPartner({ ...p, is_online: v });
  };

  const markDelivered = async (id: string) => {
    const { error } = await supabase.rpc("partner_mark_delivered", { _order_id: id });
    if (error) toast.error(error.message); else toast.success("Delivered!");
  };

  const available = useQuery({
    queryKey: ["dashboard-available-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total, address")
        .eq("status", "packed")
        .is("partner_id", null)
        .order("placed_at", { ascending: true })
        .limit(10);
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  const assigned = useQuery({
    queryKey: ["assigned-to-me", partner?.id],
    queryFn: async () => {
      if (!partner) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total, address, shop_id")
        .eq("partner_id", partner.id)
        .eq("status", "packed")
        .order("placed_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!partner,
    refetchInterval: 5000,
  });

  const acceptAvailable = async (id: string) => {
    const { error } = await supabase.rpc("partner_accept_order", { _order_id: id });
    if (error) toast.error(error.message);
    else {
      toast.success("Accepted! Start delivery.");
      qc.invalidateQueries({ queryKey: ["dashboard-available-orders"] });
      qc.invalidateQueries({ queryKey: ["assigned-to-me", partner?.id] });
      qc.invalidateQueries({ queryKey: ["my-deliveries"] });
    }
  };

  const declineAssignment = async (id: string) => {
    const { error } = await supabase.rpc("partner_decline_assignment", { _order_id: id });
    if (error) toast.error(error.message);
    else {
      toast.message("Declined. Reassigning…");
      qc.invalidateQueries({ queryKey: ["assigned-to-me", partner?.id] });
    }
  };

  // Attendance
  const attendance = useQuery({
    queryKey: ["partner-attendance", partner?.id],
    queryFn: async () => {
      if (!partner) return { rows: [], hours: 0, open: null };
      const { data: rows } = await supabase
        .from("partner_attendance")
        .select("id, check_in_at, check_out_at")
        .eq("partner_id", partner.id)
        .order("check_in_at", { ascending: false })
        .limit(7);
      const { data: hours } = await supabase.rpc("partner_today_hours", { _partner_id: partner.id });
      const open = (rows ?? []).find((r: any) => !r.check_out_at) ?? null;
      return { rows: rows ?? [], hours: Number(hours ?? 0), open };
    },
    enabled: !!partner,
    refetchInterval: 30000,
  });

  const checkIn = async () => {
    const { error } = await supabase.rpc("partner_check_in");
    if (error) toast.error(error.message);
    else { toast.success("Checked in"); attendance.refetch(); }
  };
  const checkOut = async () => {
    const { error } = await supabase.rpc("partner_check_out");
    if (error) toast.error(error.message);
    else { toast.success("Checked out"); attendance.refetch(); setPartner((p: any) => p ? { ...p, is_online: false } : p); }
  };

  return (
    <RoleShell role="delivery" nav={NAV} requireRoles={["delivery", "admin"]}>
      <div className="p-4 md:p-6 space-y-5">
        <div className="rounded-3xl gradient-hero p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Status</div>
              <div className="font-display text-2xl font-extrabold">{partner?.is_online ? "Online" : "Offline"}</div>
              {partner?.is_online && (
                <div className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  {myPos ? `Live: ${myPos.lat.toFixed(4)}, ${myPos.lng.toFixed(4)}` : "Waiting for GPS…"}
                </div>
              )}
            </div>
            <Switch checked={partner?.is_online ?? false} onCheckedChange={toggleOnline} />
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-bold">Attendance</div>
              <div className="text-xs text-muted-foreground">
                Today: <span className="font-bold text-foreground">{attendance.data?.hours.toFixed(2) ?? "0.00"}h</span>
                {attendance.data?.open && <span className="ml-2 text-green-600 font-semibold">• Checked in</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={checkIn} disabled={!!attendance.data?.open} className="rounded-xl gradient-primary text-primary-foreground">Check In</Button>
              <Button size="sm" variant="outline" onClick={checkOut} disabled={!attendance.data?.open} className="rounded-xl">Check Out</Button>
            </div>
          </div>
          {(attendance.data?.rows.length ?? 0) > 0 && (
            <div className="mt-3 border-t border-border pt-3 text-xs space-y-1">
              {(attendance.data?.rows ?? []).map((r: any) => {
                const inT = new Date(r.check_in_at);
                const outT = r.check_out_at ? new Date(r.check_out_at) : null;
                const hrs = ((outT ?? new Date()).getTime() - inT.getTime()) / 3.6e6;
                return (
                  <div key={r.id} className="flex justify-between text-muted-foreground">
                    <span>{inT.toLocaleDateString()} {inT.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {outT ? outT.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                    <span className="font-semibold text-foreground">{hrs.toFixed(2)}h</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-bold mb-3">Assigned to you {((assigned.data?.length ?? 0) > 0) && <span className="ml-2 rounded-full bg-yellow-200 text-yellow-900 px-2 py-0.5 text-[10px] font-bold">{assigned.data!.length}</span>}</h2>
          <div className="space-y-3">
            {(assigned.data ?? []).map((o: any) => (
              <div key={o.id} className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 space-y-2">
                <div className="min-w-0">
                  <div className="font-bold">{o.order_number} <span className="text-muted-foreground font-normal">• {rupees(o.total)}</span></div>
                  <div className="text-xs text-muted-foreground">{(o.address as any)?.line1}, {(o.address as any)?.city}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptAvailable(o.id)} className="flex-1 rounded-xl gradient-primary text-primary-foreground" disabled={!partner?.is_online}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => declineAssignment(o.id)} className="rounded-xl">Decline</Button>
                </div>
              </div>
            ))}
            {(assigned.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">Nothing assigned right now.</div>}
          </div>
        </section>

        <section>

          <h2 className="font-bold mb-3">Available orders {((available.data?.length ?? 0) > 0) && <span className="ml-2 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-bold">{available.data!.length} new</span>}</h2>
          <div className="space-y-3">
            {(available.data ?? []).map((o: any) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-bold">{o.order_number} <span className="text-muted-foreground font-normal">• {rupees(o.total)}</span></div>
                  <div className="text-xs text-muted-foreground">{(o.address as any)?.line1}, {(o.address as any)?.city}</div>
                </div>
                <Button size="sm" onClick={() => acceptAvailable(o.id)} className="rounded-xl gradient-primary text-primary-foreground" disabled={!partner?.is_online}>
                  {partner?.is_online ? "Accept" : "Go online to accept"}
                </Button>
              </div>
            ))}
            {(available.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No available orders right now.</div>}
          </div>
        </section>

        <section>
          <h2 className="font-bold mb-3">Active deliveries</h2>
          <div className="space-y-4">
            {(myDeliveries.data ?? []).map((o: any) => {
              const points = [
                myPos ? { lat: myPos.lat, lng: myPos.lng, label: "You" } : null,
                o.shop ? { lat: o.shop.latitude, lng: o.shop.longitude, label: `Shop: ${o.shop.name}` } : null,
                o.delivery_lat && o.delivery_lng ? { lat: o.delivery_lat, lng: o.delivery_lng, label: `Drop: ${(o.address as any)?.name ?? "Customer"}` } : null,
              ].filter(Boolean) as { lat: number; lng: number; label: string }[];
              return (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-bold">{o.order_number} <span className="text-muted-foreground font-normal">• {rupees(o.total)}</span></div>
                      <div className="text-xs text-muted-foreground">{(o.address as any)?.line1}, {(o.address as any)?.city}</div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <MessageCustomerDialog orderId={o.id} orderNumber={o.order_number} />
                      <Button size="sm" onClick={() => markDelivered(o.id)} className="rounded-xl"><Check className="h-3 w-3 mr-1" />Mark delivered</Button>
                    </div>
                  </div>
                  <RouteMap points={points} height="h-56" />
                </div>
              );
            })}
            {(myDeliveries.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No active deliveries. Check <a href="/delivery/available-orders" className="text-primary font-bold">available orders</a>.</div>}
          </div>
        </section>
      </div>
    </RoleShell>
  );
}



export { NAV as DELIVERY_NAV };
