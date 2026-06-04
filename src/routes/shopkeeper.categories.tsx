import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag, Layers, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageInput } from "@/components/ImageInput";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";

export const Route = createFileRoute("/shopkeeper/categories")({
  head: () => ({ meta: [{ title: "Categories — Shopkeeper" }] }),
  component: Page,
});

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [shopId, setShopId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDel, setConfirmDel] = useState<Category | null>(null);
  const [picking, setPicking] = useState<Category | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle()
      .then(({ data }) => setShopId(data?.id ?? null));
  }, [user]);

  const list = useQuery({
    queryKey: ["shop-categories", shopId],
    enabled: !!shopId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("shop_categories")
        .select("id, name, slug, image_url, display_order, is_active")
        .eq("shop_id", shopId!)
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  const save = useMutation({
    mutationFn: async (c: Partial<Category>) => {
      const payload = { ...c, slug: c.slug || slugify(c.name || "") };
      if (editing?.id) {
        const { error } = await (supabase as any).from("shop_categories").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("shop_categories").insert({ ...payload, shop_id: shopId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["shop-categories", shopId] });
      setOpen(false); setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("shop_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["shop-categories", shopId] });
      setConfirmDel(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-4 md:p-6 max-w-5xl space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl font-extrabold flex items-center gap-2 flex-1">
            <Tag className="h-7 w-7 text-primary" /> My Categories
          </h1>
          <div className="flex gap-2 rounded-full bg-secondary p-1">
            <span className="px-3 py-1.5 rounded-full bg-background text-sm font-semibold inline-flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Categories</span>
            <Link to="/shopkeeper/collections" className="px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1 hover:bg-background/50"><Layers className="h-3.5 w-3.5" /> Collections</Link>
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
                <img src={c.image_url} alt={c.name} className="h-28 w-full object-cover" />
                <div className="p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">/{c.slug} · order {c.display_order} {c.is_active ? "" : "· hidden"}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmDel(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {(list.data?.length ?? 0) === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No categories yet.</p>}
          </div>
        )}

        <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category?</AlertDialogTitle>
              <AlertDialogDescription>"{confirmDel?.name}" will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDel && del.mutate(confirmDel.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleShell>
  );
}

function Editor({ initial, onSave, saving }: { initial: Category | null; onSave: (c: Partial<Category>) => void; saving: boolean }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [order, setOrder] = useState(initial?.display_order ?? 0);
  const [active, setActive] = useState(initial?.is_active ?? true);

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{initial ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><label className="text-xs font-bold">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="text-xs font-bold">Slug</label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name)} /></div>
        <ImageInput value={imageUrl} onChange={setImageUrl} bucket="categories" label="Cover image" required />
        <div><label className="text-xs font-bold">Display order</label><Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
        <div className="flex items-center gap-3"><Switch checked={active} onCheckedChange={setActive} /><span className="text-sm">Active (visible to customers)</span></div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name || !imageUrl || saving}
          onClick={() => onSave({ name, slug: slug || slugify(name), image_url: imageUrl, display_order: order, is_active: active })}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
