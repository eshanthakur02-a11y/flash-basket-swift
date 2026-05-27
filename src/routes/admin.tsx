import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Package, Users, TrendingUp, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FlashBasket" }] }),
  component: AdminPage,
});

const STATUSES = ["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"orders" | "products">("orders");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error("Admin access required");
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading]);

  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("placed_at", { ascending: false }).limit(100)).data ?? [],
    enabled: isAdmin,
  });

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("id, name, slug, price, stock, is_available, image_url").order("name").limit(200)).data ?? [],
    enabled: isAdmin,
  });

  const stats = {
    orders: orders.data?.length ?? 0,
    revenue: orders.data?.reduce((s, o) => s + Number(o.total), 0) ?? 0,
    pending: orders.data?.filter((o) => ["placed", "confirmed", "packed"].includes(o.status)).length ?? 0,
    products: products.data?.length ?? 0,
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.rpc("admin_update_order_status", { _order_id: id, _status: status as any });
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  };

  const updateStock = async (id: string, stock: number) => {
    const { error } = await supabase.from("products").update({ stock }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  if (!isAdmin) return <div className="mx-auto max-w-md px-4 py-20 text-center text-muted-foreground">Checking permissions…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="font-display text-3xl font-extrabold">Admin Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={<ShoppingBag />} label="Orders" value={stats.orders.toString()} />
        <Stat icon={<TrendingUp />} label="Revenue" value={rupees(stats.revenue)} />
        <Stat icon={<Package />} label="Pending" value={stats.pending.toString()} />
        <Stat icon={<Users />} label="Products" value={stats.products.toString()} />
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        {(["orders", "products"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-bold capitalize ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <div className="mt-4 overflow-auto rounded-2xl border border-border bg-card shadow-card">
          {orders.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Placed</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.data?.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">
                      <Link to="/orders/$id" params={{ id: o.id }} className="hover:underline">{o.order_number}</Link>
                    </td>
                    <td className="px-3 py-2">{rupees(o.total)}</td>
                    <td className="px-3 py-2 uppercase text-xs">{o.payment_method}</td>
                    <td className="px-3 py-2">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(o.placed_at).toLocaleString()}</td>
                    <td className="px-3 py-2"><Link to="/orders/$id" params={{ id: o.id }}><Button size="sm" variant="ghost">View</Button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-auto rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {products.data?.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2 flex items-center gap-2">
                    {p.image_url && <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover" />}
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="hover:underline">{p.name}</Link>
                  </td>
                  <td className="px-3 py-2">{rupees(p.price)}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      defaultValue={p.stock}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v !== p.stock) updateStock(p.id, v);
                      }}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">{p.is_available ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
        <strong>👑 Promote a user to admin:</strong> Run this SQL in the database:
        <pre className="mt-2 text-xs bg-background/60 p-2 rounded-md overflow-auto">
{`INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email='you@example.com';`}
        </pre>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-semibold uppercase">{label}</div>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="font-display text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
