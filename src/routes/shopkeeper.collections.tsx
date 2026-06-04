import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { Plus, Pencil, Trash2, Layers, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageInput } from "@/components/ImageInput";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";

export const Route = createFileRoute("/shopkeeper/collections")({
  head: () => ({ meta: [{ title: "Collections — Shopkeeper" }] }),
  component: Page,
});

type Collection = {
  id: string; name: string; description: string | null; image_url: string | null;
  display_order: number; is_active: boolean;
};

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [shopId, setShopId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [confirmDel, setConfirmDel] = useState<Collection | null>(null);
  const [picking, setPicking] = useState<Collection | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle()
      .then(({ data }) => setShopId(data?.id ?? null));
  }, [user]);

  const list = useQuery({
    queryKey: ["shop-collections", shopId],
    enabled: !!shopId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_collections")
        .select("id, name, description, image_url, display_order, is_active")
        .eq("shop_id", shopId!)
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as Collection[];
    },
  });

  const save = useMutation({
    mutationFn: async (c: Partial<Collection>) => {
      if (editing?.id) {
        const { error } = await supabase.from("shop_collections").update(c).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shop_collections").insert({ ...c, shop_id: shopId } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["shop-collections", shopId] });
      setOpen(false); setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["shop-collections", shopId] });
      setConfirmDel(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-4 md:p-6 max-w-5xl space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl font-extrabold flex items-center gap-2 flex-1">
            <Layers className="h-7 w-7 text-primary" /> My Collections
          </h1>
          <div className="flex gap-2 rounded-full bg-secondary p-1">
            <Link to="/shopkeeper/categories" className="px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1 hover:bg-background/50"><Tag className="h-3.5 w-3.5" /> Categories</Link>
            <span className="px-3 py-1.5 rounded-full bg-background text-sm font-semibold inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Collections</span>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-1" />New</Button>
            </DialogTrigger>
            <Editor initial={editing} saving={save.isPending} onSave={(c) => save.mutate(c)} />
          </Dialog>
        </div>

        {!shopId ? (
          <p className="text-sm text-muted-foreground">No shop assigned to your account.</p>
        ) : list.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.data?.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="h-28 w-full object-cover" />
                ) : (
                  <div className="h-28 grid place-items-center bg-secondary/40"><Layers className="h-8 w-8 text-muted-foreground" /></div>
                )}
                <div className="p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.description ?? "—"}</div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setPicking(c)}>Items</Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmDel(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {(list.data?.length ?? 0) === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No collections yet.</p>}
          </div>
        )}

        <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete collection?</AlertDialogTitle>
              <AlertDialogDescription>"{confirmDel?.name}" will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDel && del.mutate(confirmDel.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {picking && shopId && (
          <ItemPicker shopId={shopId} collection={picking} onClose={() => setPicking(null)} />
        )}
      </div>
    </RoleShell>
  );
}

function Editor({ initial, onSave, saving }: { initial: Collection | null; onSave: (c: Partial<Collection>) => void; saving: boolean }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [order, setOrder] = useState(initial?.display_order ?? 0);
  const [active, setActive] = useState(initial?.is_active ?? true);

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{initial ? "Edit collection" : "New collection"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><label className="text-xs font-bold">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="text-xs font-bold">Description</label><Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        <ImageInput value={imageUrl ?? ""} onChange={setImageUrl} bucket="shop-collections" label="Cover image" required />
        <div><label className="text-xs font-bold">Display order</label><Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
        <div className="flex items-center gap-3"><Switch checked={active} onCheckedChange={setActive} /><span className="text-sm">Active (visible to customers)</span></div>
      </div>
      <DialogFooter>
        <Button disabled={!name || !imageUrl || saving} onClick={() => onSave({ name, description, image_url: imageUrl, display_order: order, is_active: active })}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ItemPicker({ shopId, collection, onClose }: { shopId: string; collection: Collection; onClose: () => void }) {
  const qc = useQueryClient();
  const products = useQuery({
    queryKey: ["shop-prods-for-collection", shopId],
    queryFn: async () => {
      const { data } = await supabase
        .from("shop_products")
        .select("product_id, products(id, name, image_url)")
        .eq("shop_id", shopId)
        .limit(500);
      return (data ?? []).map((r: any) => r.products).filter(Boolean);
    },
  });
  const selected = useQuery({
    queryKey: ["shop-collection-items", collection.id],
    queryFn: async () => {
      const { data } = await supabase.from("shop_collection_items").select("product_id").eq("collection_id", collection.id);
      return new Set((data ?? []).map((r: any) => r.product_id as string));
    },
  });

  const toggle = async (pid: string) => {
    const isIn = selected.data?.has(pid);
    if (isIn) {
      await supabase.from("shop_collection_items").delete().eq("collection_id", collection.id).eq("product_id", pid);
    } else {
      await supabase.from("shop_collection_items").insert({ collection_id: collection.id, product_id: pid });
    }
    qc.invalidateQueries({ queryKey: ["shop-collection-items", collection.id] });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Products in “{collection.name}”</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {(products.data ?? []).map((p: any) => {
            const on = selected.data?.has(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)} className={`w-full flex items-center gap-3 rounded-xl border p-2 text-left ${on ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                {p.image_url ? <img src={p.image_url} className="h-10 w-10 rounded-lg object-cover" alt="" /> : <div className="h-10 w-10 rounded-lg bg-secondary" />}
                <span className="flex-1 text-sm font-semibold truncate">{p.name}</span>
                {on && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
          {(products.data?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No products in your shop yet.</p>}
        </div>
        <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
