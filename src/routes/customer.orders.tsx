import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { rupees } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/customer/orders")({
  head: () => ({ meta: [{ title: "Orders — FlashBasket" }] }),
  component: AppOrders,
});

const statusColor: Record<string, string> = {
  placed: "bg-warning/20 text-warning-foreground",
  confirmed: "bg-warning/20 text-warning-foreground",
  packed: "bg-accent text-accent-foreground",
  out_for_delivery: "bg-primary/20 text-primary",
  delivered: "bg-success/30 text-success-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

function AppOrders() {
  const { user } = useAuth();
  const orders = useQuery({
    queryKey: ["app-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("placed_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    refetchInterval: 20000,
  });

  return (
    <div className="px-4 py-4">
      <h1 className="font-display text-2xl font-extrabold mb-4">My orders</h1>
      {orders.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : orders.data?.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-14 w-14 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
          <Link
            to="/customer/categories"
            className="mt-4 inline-block rounded-2xl gradient-primary px-5 py-2.5 font-bold text-primary-foreground shadow-glow text-sm"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.data?.map((o) => (
            <Link
              key={o.id}
              to="/customer/orders/$id"
              params={{ id: o.id }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card hover:shadow-glow transition"
            >
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground truncate">{o.order_number}</div>
                <div className="font-bold text-sm">{rupees(o.total)} • {o.payment_method.toUpperCase()}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(o.placed_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 ${statusColor[o.status] ?? "bg-secondary"}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
