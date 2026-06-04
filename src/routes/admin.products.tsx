import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { rupees } from "@/lib/format";

const searchSchema = z.object({ filter: z.string().optional() });

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  validateSearch: searchSchema,
  component: Page,
});

type Product = {
  id: string; name: string; slug: string; description: string | null; image_url: string | null;
  category_id: string | null; price: number; mrp: number; unit: string; stock: number; brand: string | null;
  is_available: boolean; is_featured: boolean; is_bestseller: boolean;
};
type Category = { id: string; name: string };

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
const LOW_STOCK = 5;

function Page() {
  const { filter } = useSearch({ from: "/admin/products" });
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Product | null>(null);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: Partial<Product>) => {
      const payload = { ...p, slug: p.slug || slugify(p.name || "") };
      if (editing?.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-products"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-products"] }); setConfirmDel(null); },
    onError: (e: any) => toast.error(e.message),
  });

  let filtered = data.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  if (catFilter !== "all") filtered = filtered.filter(p => p.category_id === catFilter);
  if (filter === "low-stock") filtered = filtered.filter(p => p.stock <= LOW_STOCK);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-display font-extrabold flex-1">
          Products
          {filter === "low-stock" && <span className="ml-2 text-xs bg-destructive/15 text-destructive px-2 py-1 rounded-full inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Low stock</span>}
        </h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-1" />Add</Button></DialogTrigger>
          <ProductDialog initial={editing} categories={cats} onSave={(p) => save.mutate(p)} saving={save.isPending} />
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} className="flex-1" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="sm:w-56"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-secondary overflow-hidden grid place-items-center">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <Package className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.unit} · {p.brand ?? "—"}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-primary">{rupees(p.price)}</span>
                    {p.mrp > p.price && <span className="text-xs line-through text-muted-foreground">{rupees(p.mrp)}</span>}
                  </div>
                  <div className={`text-xs mt-1 ${p.stock <= LOW_STOCK ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                    Stock: {p.stock}
                  </div>
                </div>
              </div>
              <div className="flex border-t border-border">
                <button onClick={() => { setEditing(p); setOpen(true); }} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold hover:bg-secondary"><Pencil className="h-4 w-4" />Edit</button>
                <button onClick={() => setConfirmDel(p)} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-destructive hover:bg-secondary border-l border-border"><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No products found.</p>}
        </div>
      )}

      <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>"{confirmDel?.name}" will be permanently removed.</AlertDialogDescription>
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

function ProductDialog({ initial, categories, onSave, saving }: { initial: Product | null; categories: Category[]; onSave: (p: Partial<Product>) => void; saving: boolean }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [mrp, setMrp] = useState(initial?.mrp ?? 0);
  const [unit, setUnit] = useState(initial?.unit ?? "1 pc");
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [available, setAvailable] = useState(initial?.is_available ?? true);
  const [featured, setFeatured] = useState(initial?.is_featured ?? false);
  const [bestseller, setBestseller] = useState(initial?.is_bestseller ?? false);

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{initial ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><label className="text-xs font-bold">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold">Slug</label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name)} /></div>
          <div><label className="text-xs font-bold">Brand</label><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
        </div>
        <div>
          <label className="text-xs font-bold">Category</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><label className="text-xs font-bold">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        <div><label className="text-xs font-bold">Image URL</label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-xs font-bold">Price ₹</label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          <div><label className="text-xs font-bold">MRP ₹</label><Input type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} /></div>
          <div><label className="text-xs font-bold">Stock</label><Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></div>
        </div>
        <div><label className="text-xs font-bold">Unit (e.g. 500g, 1L)</label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm"><Switch checked={available} onCheckedChange={setAvailable} />Available</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={featured} onCheckedChange={setFeatured} />Featured</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={bestseller} onCheckedChange={setBestseller} />Bestseller</label>
        </div>
      </div>
      <DialogFooter>
        <Button disabled={!name || !categoryId || saving} onClick={() => onSave({
          name, slug: slug || slugify(name), description, image_url: imageUrl, category_id: categoryId,
          price, mrp: mrp || price, unit, stock, brand,
          is_available: available, is_featured: featured, is_bestseller: bestseller,
        })}>{saving ? "Saving..." : "Save"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
