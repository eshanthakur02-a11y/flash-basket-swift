import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rupees } from "@/lib/format";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";

export const Route = createFileRoute("/shopkeeper/products")({
  head: () => ({ meta: [{ title: "Products — Shopkeeper" }] }),
  component: Page,
});

type ShopProduct = {
  id: string;
  price: number;
  stock: number;
  is_available: boolean;
  product_id: string;
  products: { id: string; name: string; unit: string; image_url: string | null; mrp: number; price: number } | null;
};

type CatalogProduct = {
  id: string;
  name: string;
  unit: string;
  image_url: string | null;
  price: number;
  mrp: number;
};

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [shopId, setShopId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ShopProduct | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ShopProduct | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => setShopId(data?.id ?? null));
  }, [user]);

  const items = useQuery({
    queryKey: ["shop-products", shopId],
    queryFn: async () => {
      if (!shopId) return [] as ShopProduct[];
      const { data, error } = await supabase
        .from("shop_products")
        .select("id, price, stock, is_available, product_id, products(id, name, unit, image_url, mrp, price)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as any as ShopProduct[];
    },
    enabled: !!shopId,
  });

  const filtered = useMemo(() => {
    const list = items.data ?? [];
    if (!q.trim()) return list;
    return list.filter((sp) => sp.products?.name?.toLowerCase().includes(q.toLowerCase()));
  }, [items.data, q]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["shop-products", shopId] });

  async function handleDelete(sp: ShopProduct) {
    const { error } = await supabase.from("shop_products").delete().eq("id", sp.id);
    if (error) return toast.error(error.message);
    toast.success("Removed from inventory");
    setConfirmDel(null);
    refresh();
  }

  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl font-extrabold flex-1">Inventory</h1>
          {shopId && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" />Add product</Button>
              </DialogTrigger>
              <AddProductDialog
                shopId={shopId}
                existingProductIds={new Set((items.data ?? []).map((s) => s.product_id))}
                onDone={() => { setAddOpen(false); refresh(); }}
              />
            </Dialog>
          )}
        </div>

        {!shopId ? (
          <p className="mt-6 text-sm text-muted-foreground">No shop assigned to your account.</p>
        ) : (
          <>
            <div className="mt-4 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your inventory..." className="pl-9" />
            </div>

            {items.isLoading ? (
              <p className="mt-6 text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="mt-6 text-muted-foreground text-center py-10">
                {q ? "No matches." : "No products yet. Tap Add product to get started."}
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((sp) => (
                  <div key={sp.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="flex gap-3 p-3">
                      {sp.products?.image_url ? (
                        <img src={sp.products.image_url} alt={sp.products.name} className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-secondary grid place-items-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{sp.products?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{sp.products?.unit}</div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="font-bold text-primary">{rupees(sp.price)}</span>
                          <span className={`text-xs ${sp.stock <= 5 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                            Stock: {sp.stock}
                          </span>
                          {!sp.is_available && <span className="text-xs bg-muted px-2 rounded-full">Hidden</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex border-t border-border">
                      <button onClick={() => { setEditing(sp); setEditOpen(true); }} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold hover:bg-secondary">
                        <Pencil className="h-4 w-4" />Edit
                      </button>
                      <button onClick={() => setConfirmDel(sp)} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-destructive hover:bg-secondary border-l border-border">
                        <Trash2 className="h-4 w-4" />Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditing(null); }}>
          {editing && (
            <EditDialog
              item={editing}
              onSaved={() => { setEditOpen(false); setEditing(null); refresh(); }}
            />
          )}
        </Dialog>

        <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from inventory?</AlertDialogTitle>
              <AlertDialogDescription>"{confirmDel?.products?.name}" will no longer be sold by your shop.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDel && handleDelete(confirmDel)}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleShell>
  );
}

function EditDialog({ item, onSaved }: { item: ShopProduct; onSaved: () => void }) {
  const [price, setPrice] = useState(item.price);
  const [stock, setStock] = useState(item.stock);
  const [available, setAvailable] = useState(item.is_available);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("shop_products")
      .update({ price, stock, is_available: available })
      .eq("id", item.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    onSaved();
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{item.products?.name}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold">Price ₹</label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-bold">Stock</label>
            <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={available} onCheckedChange={setAvailable} />Available to customers
        </label>
      </div>
      <DialogFooter>
        <Button disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AddProductDialog({
  shopId, existingProductIds, onDone,
}: { shopId: string; existingProductIds: Set<string>; onDone: () => void }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const catalog = useQuery({
    queryKey: ["catalog-add", q],
    queryFn: async () => {
      let qb = supabase.from("products").select("id, name, unit, image_url, price, mrp").order("name").limit(50);
      if (q.trim()) qb = qb.ilike("name", `%${q}%`);
      const { data, error } = await qb;
      if (error) throw error;
      return (data ?? []) as CatalogProduct[];
    },
  });

  function pick(p: CatalogProduct) {
    setSelected(p);
    setPrice(p.price);
    setStock(0);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("shop_products").insert({
      shop_id: shopId,
      product_id: selected.id,
      price,
      stock,
      is_available: true,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Added to inventory");
    onDone();
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Add product to your shop</DialogTitle></DialogHeader>
      {!selected ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search catalog..." className="pl-9" />
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border rounded-xl border border-border">
            {(catalog.data ?? []).map((p) => {
              const exists = existingProductIds.has(p.id);
              return (
                <button
                  key={p.id}
                  disabled={exists}
                  onClick={() => pick(p)}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-secondary disabled:opacity-50"
                >
                  {p.image_url ? <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-secondary" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.unit} · MRP {rupees(p.mrp)}</div>
                  </div>
                  {exists && <span className="text-xs text-muted-foreground">Added</span>}
                </button>
              );
            })}
            {catalog.data && catalog.data.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">No products found.</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary">
            {selected.image_url ? <img src={selected.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-card" />}
            <div className="flex-1">
              <div className="font-bold text-sm">{selected.name}</div>
              <div className="text-xs text-muted-foreground">{selected.unit}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Change</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold">Your price ₹</label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-bold">Stock</label>
              <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button disabled={!selected || saving} onClick={save}>{saving ? "Adding..." : "Add to inventory"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
