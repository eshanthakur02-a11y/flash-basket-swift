import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Package, Truck, Home, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/orders/$id")({
  head: ({ params }) => ({ meta: [{ title: `Order #${params.id.slice(0, 8)} — FlashBasket` }] }),
  component: OrderPage,
});

const STEPS = [
  { key: "placed", label: "Placed", icon: Check },
  { key: "payment_confirmed", label: "Confirmed", icon: Check },
  { key: "packing", label: "Packed", icon: Package },
  { key: "out_for_delivery", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

function OrderPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  const order = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      const { data: it } = await supabase.from("order_items").select("*").eq("order_id", id);
      return o ? { ...o, items: it ?? [] } : null;
    },
    refetchInterval: 8000,
  });

  if (order.isLoading) return <div className="mx-auto max-w-3xl px-4 py-10"><Skeleton className="h-96" /></div>;
  if (!order.data) return <div className="mx-auto max-w-3xl px-4 py-20 text-center">Order not found.</div>;

  const o = order.data;
  const currentIdx = STEPS.findIndex((s) => s.key === o.status);
  const isCancelled = o.status === "cancelled";
  const canCancel = o.status === "placed" || o.status === "payment_confirmed";

  const cancel = async () => {
    if (!confirm("Cancel this order? Stock will be restored.")) return;
    setCancelling(true);
    const { error } = await supabase.rpc("cancel_order", { _order_id: id, _reason: "Customer request" });
    setCancelling(false);
    if (error) return toast.error(error.message);
    toast.success("Order cancelled");
    qc.invalidateQueries({ queryKey: ["order", id] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/orders" className="text-sm text-muted-foreground hover:underline">← All orders</Link>

      <div className="mt-4 rounded-3xl gradient-hero border border-border p-6 shadow-card">
        <div className="text-xs font-semibold text-muted-foreground">Order</div>
        <div className="font-display text-3xl font-extrabold">{o.order_number}</div>
        <div className="text-sm mt-1">Placed {new Date(o.placed_at).toLocaleString()}</div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-3 py-1 text-xs font-bold">
          <Clock className="h-3 w-3" />
          {isCancelled ? "Cancelled" : "Arriving in ~10 minutes"}
        </div>
      </div>

      {!isCancelled && (
        <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-bold mb-4">Track order</h2>
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-1 bg-border rounded-full" />
            <motion.div
              className="absolute top-5 left-5 h-1 gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.6 }}
              style={{ right: `${100 - (currentIdx / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i <= currentIdx;
              return (
                <div key={s.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div className={`h-10 w-10 rounded-full grid place-items-center border-2 ${done ? "gradient-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className={`text-[10px] font-bold text-center ${done ? "" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isCancelled && (
        <div className="mt-6 rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 font-bold text-destructive"><X className="h-4 w-4" /> Order cancelled</div>
          {o.cancel_reason && <div className="text-sm text-muted-foreground mt-1">Reason: {o.cancel_reason}</div>}
        </div>
      )}

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-bold mb-3">Items ({o.items.length})</h2>
        <div className="space-y-3">
          {o.items.map((it: any) => (
            <div key={it.id} className="flex items-center gap-3">
              {it.image_url ? (
                <img src={it.image_url} className="h-14 w-14 rounded-xl object-cover" alt={it.name} />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-secondary grid place-items-center">🛒</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-1">{it.name}</div>
                <div className="text-xs text-muted-foreground">{it.unit} • Qty {it.quantity}</div>
              </div>
              <div className="font-bold text-sm">{rupees(it.price * it.quantity)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-bold mb-2">Bill summary</h3>
          <Row label="Subtotal" value={rupees(o.subtotal)} />
          {o.discount > 0 && <Row label="Discount" value={`- ${rupees(o.discount)}`} className="text-success" />}
          <Row label="Delivery" value={o.delivery_fee === 0 ? "FREE" : rupees(o.delivery_fee)} />
          <Row label="Handling" value={rupees(o.handling_fee)} />
          <div className="h-px bg-border my-2" />
          <Row label="Total paid" value={rupees(o.total)} bold />
          <div className="mt-2 text-xs text-muted-foreground">Payment: {o.payment_method.toUpperCase()} • {o.payment_status}</div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-bold mb-2">Delivery to</h3>
          <div className="text-sm">
            <div className="font-medium">{(o.address as any)?.name}</div>
            <div className="text-muted-foreground">
              {(o.address as any)?.line1}, {(o.address as any)?.city}, {(o.address as any)?.state} - {(o.address as any)?.pincode}
            </div>
            <div className="text-muted-foreground mt-1">📞 {(o.address as any)?.phone}</div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex gap-3">
        {canCancel && (
          <Button onClick={cancel} disabled={cancelling} variant="outline" className="rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            {cancelling ? "Cancelling…" : "Cancel order"}
          </Button>
        )}
        <Button variant="outline" className="rounded-xl" onClick={() => navigate({ to: "/products" })}>Shop more</Button>
      </div>
    </div>
  );
}

function Row({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className={`flex justify-between text-sm py-0.5 ${bold ? "font-bold text-base" : ""} ${className ?? ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
