import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LayoutDashboard, PackageOpen, History, Wallet, Bell, User, Truck, Check } from "lucide-react";
import { rupees } from "@/lib/format";

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

  useEffect(() => {
    if (!user) return;
    supabase.from("delivery_partners").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setPartner(data);
      else {
        // auto-create a partner record
        supabase.from("delivery_partners").insert({ user_id: user.id, name: user.email ?? "Partner", is_online: false }).select().single().then(({ data: created }) => setPartner(created));
      }
    });
  }, [user]);

  useEffect(() => {
    const ch = supabase
      .channel("delivery-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["my-deliveries"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const myDeliveries = useQuery({
    queryKey: ["my-deliveries", partner?.id],
    queryFn: async () => {
      if (!partner) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total, status, address")
        .eq("partner_id", partner.id)
        .in("status", ["out_for_delivery"])
        .order("placed_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!partner,
    refetchInterval: 8000,
  });

  const toggleOnline = async (v: boolean) => {
    const { error } = await supabase.from("delivery_partners").update({ is_online: v }).eq("id", partner.id);
    if (error) toast.error(error.message);
    else setPartner({ ...partner, is_online: v });
  };

  const markDelivered = async (id: string) => {
    const { error } = await supabase.rpc("partner_mark_delivered", { _order_id: id });
    if (error) toast.error(error.message); else toast.success("Delivered!");
  };

  return (
    <RoleShell role="delivery" nav={NAV} requireRoles={["delivery", "admin"]}>
      <div className="p-4 md:p-6 space-y-5">
        <div className="rounded-3xl gradient-hero p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Status</div>
              <div className="font-display text-2xl font-extrabold">{partner?.is_online ? "Online" : "Offline"}</div>
            </div>
            <Switch checked={partner?.is_online ?? false} onCheckedChange={toggleOnline} />
          </div>
        </div>

        <section>
          <h2 className="font-bold mb-3">Active deliveries</h2>
          <div className="space-y-3">
            {(myDeliveries.data ?? []).map(o => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-bold">{o.order_number} <span className="text-muted-foreground font-normal">• {rupees(o.total)}</span></div>
                  <div className="text-xs text-muted-foreground">{(o.address as any)?.line1}, {(o.address as any)?.city}</div>
                </div>
                <Button size="sm" onClick={() => markDelivered(o.id)} className="rounded-xl"><Check className="h-3 w-3 mr-1" />Mark delivered</Button>
              </div>
            ))}
            {(myDeliveries.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No active deliveries. Check <a href="/delivery/available-orders" className="text-primary font-bold">available orders</a>.</div>}
          </div>
        </section>
      </div>
    </RoleShell>
  );
}

export { NAV as DELIVERY_NAV };
