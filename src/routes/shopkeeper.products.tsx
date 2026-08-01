import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Package, Search, BarChart3 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { MultiImageInput } from "@/components/MultiImageInput";
import { VariantsEditor, type VariantDraft } from "@/components/VariantsEditor";
import { loadVariants, rowToDraft, saveVariants } from "@/lib/variants";
import { rupees } from "@/lib/format";
import { expiryStatus, shelfLifeDays, daysUntil } from "@/lib/expiry";
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
  manufacturing_date: string | null;
  expiry_date: string | null;

  products: {
    id: string;
    name: string;
    unit: string;
    image_url: string | null;
    cover_image: string | null;
    image_gallery: string[] | null;
    mrp: number;
    price: number;
    description: string | null;
    brand: string | null;
    category_id: string | null;
  } | null;
};

type CatalogProduct = {
  id: string;
  name: string;
  unit: string;
  image_url: string | null;
  price: number;
  mrp: number;
};

type Category = { id: string; name: string };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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
        .select("id, price, stock, is_available, product_id, manufacturing_date, expiry_date, products(id, name, unit, image_url, cover_image, image_gallery, mrp, price, description, brand, category_id)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as any as ShopProduct[];
    },
    enabled: !!shopId,
  });

  const cats = useQuery({
    queryKey: ["shop-cats-list"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      return (data ?? []) as Category[];
    },
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
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link to="/shopkeeper/inventory-insights"><BarChart3 className="h-4 w-4" />Insights</Link>
          </Button>
          {shopId && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" />Add product</Button>
              </DialogTrigger>
              <AddProductDialog
                shopId={shopId}
                categories={cats.data ?? []}
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
                        <img loading="lazy" decoding="async" src={sp.products.image_url} alt={sp.products.name} className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-secondary grid place-items-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{sp.products?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{sp.products?.unit}</div>
                        <div className="mt-1 flex items-center gap-2 text-sm flex-wrap">
                          <span className="font-bold text-primary">{rupees(sp.price)}</span>
                          <span className={`text-xs ${sp.stock <= 5 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                            Stock: {sp.stock}
                          </span>
                          {!sp.is_available && <span className="text-xs bg-muted px-2 rounded-full">Hidden</span>}
                        </div>
                        {(() => {
                          const st = expiryStatus(sp.expiry_date, sp.manufacturing_date);
                          if (st.status === "none") return null;
                          return (
                            <div className="mt-1 flex flex-wrap gap-1">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>
                                {st.emoji} {st.statusLabel}
                              </span>
                            </div>
                          );
                        })()}
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
              categories={cats.data ?? []}
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

function EditDialog({
  item, categories, onSaved,
}: { item: ShopProduct; categories: Category[]; onSaved: () => void }) {
  // shop_products fields
  const [price, setPrice] = useState(item.price);
  const [stock, setStock] = useState(item.stock);
  const [available, setAvailable] = useState(item.is_available);
  // products fields
  const [name, setName] = useState(item.products?.name ?? "");
  const [unit, setUnit] = useState(item.products?.unit ?? "1 pc");
  const [brand, setBrand] = useState(item.products?.brand ?? "");
  const [description, setDescription] = useState(item.products?.description ?? "");
  const [mrp, setMrp] = useState(item.products?.mrp ?? 0);
  const [categoryId, setCategoryId] = useState(item.products?.category_id ?? "");
  const initialGallery = (item.products?.image_gallery && item.products.image_gallery.length > 0)
    ? item.products.image_gallery
    : (item.products?.cover_image ? [item.products.cover_image] : (item.products?.image_url ? [item.products.image_url] : []));
  const [gallery, setGallery] = useState<string[]>(initialGallery);
  const [mfgDate, setMfgDate] = useState<string>(item.manufacturing_date ?? "");
  const [expDate, setExpDate] = useState<string>(item.expiry_date ?? "");
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (!item.product_id) return;
    loadVariants(item.product_id).then((rows) => setVariants(rows.map(rowToDraft))).catch(() => {});
  }, [item.product_id]);

  async function save() {
    const dErr = dateRangeError(mfgDate, expDate);
    if (dErr) { toast.error(dErr); return; }
    setSaving(true);
    try {
      if (item.product_id) {
        const { error: pErr } = await supabase
          .from("products")
          .update({
            name, unit, brand, description, mrp: mrp || price,
            image_url: gallery[0] ?? null,
            cover_image: gallery[0] ?? null,
            image_gallery: gallery,
            category_id: categoryId || null,
          })
          .eq("id", item.product_id);
        if (pErr) throw pErr;
        await saveVariants(item.product_id, variants);
      }
      // Update shop_products
      const { error } = await supabase
        .from("shop_products")
        .update({
          price,
          stock,
          is_available: available,
          manufacturing_date: mfgDate || null,
          expiry_date: expDate || null,
        } as any)
        .eq("id", item.id);
      if (error) throw error;

      toast.success("Updated");
      onSaved();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Edit product</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <MultiImageInput value={gallery} onChange={setGallery} label="Product images" required />
        <div>
          <label className="text-xs font-bold">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold">Brand</label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold">Unit (e.g. 500g)</label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold">Category</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold">Description</label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="pt-2 border-t border-border">
          <VariantsEditor variants={variants} onChange={setVariants} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold">Your price ₹</label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-bold">MRP ₹</label>
            <Input type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-bold">Stock</label>
            <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </div>
        </div>
        <DateRangeFields
          mfg={mfgDate} exp={expDate}
          onMfg={setMfgDate} onExp={setExpDate}
        />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={available} onCheckedChange={setAvailable} />Available to customers
        </label>

      </div>
      <DialogFooter>
        <Button disabled={saving || !name || gallery.length === 0} onClick={save}>{saving ? "Saving..." : "Save"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AddProductDialog({
  shopId, categories, existingProductIds, onDone,
}: { shopId: string; categories: Category[]; existingProductIds: Set<string>; onDone: () => void }) {
  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Add product</DialogTitle></DialogHeader>
      <Tabs defaultValue="new">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="new">Create new</TabsTrigger>
          <TabsTrigger value="catalog">From catalog</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-3">
          <CreateNewProduct shopId={shopId} categories={categories} onDone={onDone} />
        </TabsContent>
        <TabsContent value="catalog" className="mt-3">
          <FromCatalog shopId={shopId} existingProductIds={existingProductIds} onDone={onDone} />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}

function CreateNewProduct({
  shopId, categories, onDone,
}: { shopId: string; categories: Category[]; onDone: () => void }) {
  const [productType, setProductType] = useState<"simple" | "variants">("simple");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [unit, setUnit] = useState("1 pc");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [mfgDate, setMfgDate] = useState<string>("");
  const [expDate, setExpDate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return toast.error("Product name is required");
    if (!categoryId) return toast.error("Please select a category");

    const activeVariants = variants.filter((v) => !v._deleted);

    if (productType === "simple") {
      if (gallery.length === 0) return toast.error("Upload at least 1 product image");
      if (!unit.trim()) return toast.error("Unit is required");
      if (!(price > 0)) return toast.error("Price must be greater than 0");
      if (stock < 0) return toast.error("Stock cannot be negative");
    } else {
      if (activeVariants.length === 0) return toast.error("Add at least 1 variant");
      for (const v of activeVariants) {
        const vLabel = v.name || v.size || "Variant";
        if (!v.name.trim() && !v.size.trim()) return toast.error("Every variant needs a name");
        if (!v.unit.trim()) return toast.error(`Variant "${vLabel}" needs a unit`);
        if (!(v.selling_price > 0)) return toast.error(`Variant "${vLabel}" needs a price`);
        if (v.stock < 0) return toast.error(`Variant "${vLabel}" has invalid stock`);
        if (!v.images || v.images.length === 0) return toast.error(`Variant "${vLabel}" needs at least 1 image`);
        if (v.images.length > 6) return toast.error(`Variant "${vLabel}" can have at most 6 images`);
      }
    }

    const dErr = dateRangeError(mfgDate, expDate);
    if (dErr) { toast.error(dErr); return; }

    setSaving(true);
    try {
      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
      const isVariantMode = productType === "variants";
      const defaultV = isVariantMode
        ? (activeVariants.find((v) => v.is_default) ?? activeVariants[0])
        : null;
      const basePrice = isVariantMode ? (defaultV?.selling_price ?? 0) : price;
      const baseMrp = isVariantMode ? (defaultV?.mrp || defaultV?.selling_price || 0) : (mrp || price);
      const baseUnit = isVariantMode ? (defaultV?.unit || defaultV?.size || "1 pc") : unit;

      const { data: prod, error: pErr } = await supabase
        .from("products")
        .insert({
          name, slug, description,
          image_url: gallery[0] ?? null,
          cover_image: gallery[0] ?? null,
          image_gallery: gallery,
          category_id: categoryId, brand, unit: baseUnit,
          price: basePrice, mrp: baseMrp, stock: 0,
          is_available: true,
        })
        .select("id")
        .single();
      if (pErr) throw pErr;

      const shopStock = isVariantMode
        ? activeVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0)
        : stock;

      const { error: sErr } = await supabase.from("shop_products").insert({
        shop_id: shopId,
        product_id: prod.id,
        price: basePrice,
        stock: shopStock,
        is_available: true,
        manufacturing_date: mfgDate || null,
        expiry_date: expDate || null,
      } as any);
      if (sErr) throw sErr;

      if (isVariantMode) {
        await saveVariants(prod.id, variants);
      }
      toast.success("Product created");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <div className="space-y-4 pb-20">
        <div className="rounded-2xl border border-border bg-secondary/40 p-3">
          <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Product Type</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProductType("simple")}
              className={`rounded-xl border p-3 text-left transition ${
                productType === "simple"
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${productType === "simple" ? "border-primary" : "border-muted-foreground"}`}>
                  {productType === "simple" && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <span className="font-bold text-sm">Simple Product</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 ml-6">One price, one stock</p>
            </button>
            <button
              type="button"
              onClick={() => setProductType("variants")}
              className={`rounded-xl border p-3 text-left transition ${
                productType === "variants"
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${productType === "variants" ? "border-primary" : "border-muted-foreground"}`}>
                  {productType === "variants" && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <span className="font-bold text-sm">With Variants</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 ml-6">e.g. 500 ml, 1 L, 1 kg</p>
            </button>
          </div>
        </div>

        {productType === "simple" && (
          <div className="rounded-2xl border border-border bg-card p-3">
            <MultiImageInput value={gallery} onChange={setGallery} label="Product images (1–6)" required />
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-3 space-y-3">
          <div>
            <label className="text-xs font-bold">Name <span className="text-destructive">*</span></label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amul Gold Milk" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold">Brand</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold">Category <span className="text-destructive">*</span></label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold">Description</label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        {productType === "simple" && (
          <div className="rounded-2xl border border-border bg-card p-3 space-y-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Pricing &amp; stock</div>
            <div>
              <label className="text-xs font-bold">Unit <span className="text-destructive">*</span></label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="500g, 1L, 1 pc" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold">Price ₹ <span className="text-destructive">*</span></label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-bold">MRP ₹</label>
                <Input type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-bold">Stock <span className="text-destructive">*</span></label>
                <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
              </div>
            </div>
            <DateRangeFields mfg={mfgDate} exp={expDate} onMfg={setMfgDate} onExp={setExpDate} />
          </div>
        )}

        {productType === "variants" && (
          <div className="rounded-2xl border border-border bg-card p-3">
            <VariantsEditor variants={variants} onChange={setVariants} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 -mx-6 px-6 py-3 bg-background/95 backdrop-blur border-t border-border">
        <Button className="w-full" disabled={saving} onClick={save}>
          {saving ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </div>
  );
}



function FromCatalog({
  shopId, existingProductIds, onDone,
}: { shopId: string; existingProductIds: Set<string>; onDone: () => void }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [mfgDate, setMfgDate] = useState<string>("");
  const [expDate, setExpDate] = useState<string>("");
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
    const dErr = dateRangeError(mfgDate, expDate);
    if (dErr) { toast.error(dErr); return; }
    setSaving(true);
    const { error } = await supabase.from("shop_products").insert({
      shop_id: shopId,
      product_id: selected.id,
      price,
      stock,
      is_available: true,
      manufacturing_date: mfgDate || null,
      expiry_date: expDate || null,
    } as any);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Added to inventory");
    onDone();
  }

  if (!selected) {
    return (
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
                {p.image_url ? <img loading="lazy" decoding="async" src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-secondary" />}
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
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary">
        {selected.image_url ? <img loading="lazy" decoding="async" src={selected.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-card" />}
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
      <DateRangeFields
        mfg={mfgDate} exp={expDate}
        onMfg={setMfgDate} onExp={setExpDate}
      />
      <DialogFooter>
        <Button disabled={saving} onClick={save}>{saving ? "Adding..." : "Add to inventory"}</Button>
      </DialogFooter>
    </div>
  );
}

export function dateRangeError(mfg: string, exp: string): string | null {
  if (!mfg || !exp) return null;
  const m = new Date(mfg);
  const e = new Date(exp);
  if (isNaN(m.getTime()) || isNaN(e.getTime())) return null;
  if (e.getTime() <= m.getTime()) return "Expiry date must be later than the manufacturing date.";
  return null;
}

function DateRangeFields({
  mfg, exp, onMfg, onExp,
}: { mfg: string; exp: string; onMfg: (v: string) => void; onExp: (v: string) => void }) {
  const st = expiryStatus(exp, mfg);
  const shelf = shelfLifeDays(mfg, exp);
  const err = dateRangeError(mfg, exp);

  return (
    <div className="pt-2 border-t border-border space-y-2">
      <div className="text-xs font-bold text-muted-foreground">Manufacturing &amp; Expiry (optional)</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold flex items-center gap-1">📅 Mfg date</label>
          <Input
            type="date"
            value={mfg}
            onChange={(e) => onMfg(e.target.value)}
            max={exp || undefined}
          />
        </div>
        <div>
          <label className="text-xs font-bold flex items-center gap-1">📅 Expiry date</label>
          <Input
            type="date"
            value={exp}
            onChange={(e) => onExp(e.target.value)}
            min={mfg || undefined}
          />
        </div>
      </div>

      {err ? (
        <p className="text-[11px] font-semibold text-destructive">{err}</p>
      ) : (
        (shelf !== null || st.status !== "none") && (
          <div className="flex flex-wrap gap-2 text-[11px]">
            {shelf !== null && (
              <span className="px-2 py-0.5 rounded-full bg-secondary font-semibold">
                Shelf life: {shelf} Day{shelf === 1 ? "" : "s"}
              </span>
            )}
            {st.status !== "none" && (
              <span className={`px-2 py-0.5 rounded-full border font-semibold ${st.color}`}>
                {st.emoji} Status: {st.statusLabel}
              </span>
            )}
          </div>
        )
      )}
      <p className="text-[10px] text-muted-foreground">
        Values are calculated automatically from the dates you pick.
      </p>
    </div>
  );
}


