import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RouteMap } from "@/components/maps/RouteMap";
import { rupees } from "@/lib/format";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Package, Phone, Store, LayoutDashboard, PackageOpen, History, Wallet, User } from "lucide-react";

const NAV = [
  { to: "/delivery/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/delivery/available-orders", label: "Available", icon: PackageOpen },
  { to: "/delivery/history", label: "History", icon: History },
  { to: "/delivery/earnings", label: "Earnings", icon: Wallet },
  { to: "/delivery/profile", label: "Profile", icon: User },
];

export const Route = createFileRoute("/delivery/task/$id")({
  head: () => ({ meta: [{ title: "Delivery Task — FlashBasket" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["delivery-task", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), shops(name,address,latitude,longitude,phone)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const pickUp = async () => {
    const { error } = await supabase.rpc("partner_accept_order", { _order_id: id });
    if (error) return toast.error(error.message);
    toast.success("Marked as picked up");
    refetch();
  };
  const deliver = async () => {
    const { error } = await supabase.rpc("partner_mark_delivered", { _order_id: id });
    if (error) return toast.error(error.message);
    toast.success("Delivered!");
    router.navigate({ to: "/delivery/dashboard" });
  };

  return (
    <RoleShell role="delivery" nav={NAV}>
      <div className="space-y-4 pb-24">
        <Link to="/delivery/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && !data && <p className="text-sm text-muted-foreground">Task not found.</p>}

        {data && (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Order</p>
                  <p className="font-semibold">{data.order_number}</p>
                </div>
                <Badge variant="secondary">{String(data.status).replace(/_/g, " ")}</Badge>
              </div>
              <p className="mt-2 text-sm">Total {rupees(Number(data.total))} · {data.payment_method?.toUpperCase()}</p>
            </Card>

            {data.shops && Number.isFinite(data.shops.latitude) && Number.isFinite(data.delivery_lat) && (
              <RouteMap
                points={[
                  { lat: data.shops.latitude as number, lng: data.shops.longitude as number, label: "Shop", color: "#16a34a" },
                  { lat: data.delivery_lat as number, lng: data.delivery_lng as number, label: "Drop", color: "#dc2626" },
                ]}
              />
            )}

            {data.shops && (
              <Card className="p-4">
                <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Store className="h-3 w-3" /> Pickup from shop</p>
                <p className="font-semibold mt-1">{data.shops.name}</p>
                <p className="text-sm text-muted-foreground">{data.shops.address}</p>
                {data.shops.phone && (
                  <a href={`tel:${data.shops.phone}`} className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
                    <Phone className="h-3 w-3" /> {data.shops.phone}
                  </a>
                )}
              </Card>
            )}

            <Card className="p-4">
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Deliver to</p>
              {(() => {
                const addr = (data.address ?? {}) as Record<string, any>;
                return (
                  <>
                    <p className="font-semibold mt-1">{addr.full_name || "Customer"}</p>
                    <p className="text-sm text-muted-foreground">
                      {[addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                    {addr.phone && (
                      <a href={`tel:${addr.phone}`} className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
                        <Phone className="h-3 w-3" /> {addr.phone}
                      </a>
                    )}
                  </>
                );
              })()}
              {data.delivery_instruction && (
                <p className="mt-2 text-xs italic text-muted-foreground">Note: {data.delivery_instruction}</p>
              )}
            </Card>

            <Card className="p-4">
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" /> Items ({data.order_items?.length || 0})</p>
              <ul className="mt-2 divide-y">
                {(data.order_items || []).map((it: any) => (
                  <li key={it.id} className="flex justify-between py-2 text-sm">
                    <span>{it.name} <span className="text-muted-foreground">× {it.quantity}</span></span>
                    <span>{rupees(Number(it.price) * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="fixed bottom-20 left-0 right-0 px-4">
              <div className="mx-auto max-w-md flex gap-2">
                {data.status === "packed" && (
                  <Button className="flex-1" onClick={pickUp}>Mark as picked up</Button>
                )}
                {data.status === "out_for_delivery" && (
                  <Button className="flex-1" onClick={deliver}>Mark as delivered</Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </RoleShell>
  );
}
