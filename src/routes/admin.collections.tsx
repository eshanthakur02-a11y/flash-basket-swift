import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageInput } from "@/components/ImageInput";

export const Route = createFileRoute("/admin/collections")({
  head: () => ({ meta: [{ title: "Collections — Admin" }] }),
  component: Page,
});

type Collection = { id: string; name: string; slug: string; description: string | null; image_url: string | null; display_order: number; is_active: boolean };

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function Page() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Collection | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Collection | null>(null);
  const [q, setQ] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("collections").select("*").order("display_order");
      if (error) throw error;
      return data as Collection[];
    },
  });

  const save = useMutation({
    mutationFn: async (c: Partial<Collection>) => {
      const payload = { ...c, slug: c.slug || slugify(c.name || "") };
      if (editing?.id) {
        const { error } = await (supabase.from as any)("collections").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from as any)("collections").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-collections"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-collections"] }); setConfirmDel(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = data.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-display font-extrabold flex-1">Collections</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-1" />Add</Button>
          </DialogTrigger>
          <CollectionDialog initial={editing} onSave={(c) => save.mutate(c)} saving={save.isPending} />
        </Dialog>
      </div>

      <Input placeholder="Search collections..." value={q} onChange={(e) => setQ(e.target.value)} />

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="h-14 w-14 rounded-xl bg-secondary overflow-hidden grid place-items-center">
                {c.image_url ? <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" /> : <Layers className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate flex items-center gap-2">
                  {c.name}
                  {!c.is_active && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Hidden</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate">/{c.slug}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setConfirmDel(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No collections yet.</p>}
        </div>
      )}

      <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>"{confirmDel?.name}" and its product links will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDel && del.mutate(confirmDel.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CollectionDialog({ initial, onSave, saving }: { initial: Collection | null; onSave: (c: Partial<Collection>) => void; saving: boolean }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [order, setOrder] = useState(initial?.display_order ?? 0);
  const [active, setActive] = useState(initial?.is_active ?? true);

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{initial ? "Edit collection" : "New collection"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><label className="text-xs font-bold">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="text-xs font-bold">Slug</label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name)} /></div>
        <div><label className="text-xs font-bold">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        <ImageInput value={imageUrl ?? ""} onChange={setImageUrl} bucket="categories" label="Cover image" required />
        <div><label className="text-xs font-bold">Display order</label><Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
        <div className="flex items-center gap-3"><Switch checked={active} onCheckedChange={setActive} /><span className="text-sm">Active (visible to customers)</span></div>
      </div>
      <DialogFooter>
        <Button disabled={!name || !imageUrl || saving} onClick={() => onSave({ name, slug: slug || slugify(name), description, image_url: imageUrl, display_order: order, is_active: active })}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
