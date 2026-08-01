import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CartLine {
  id: string;
  product_id: string;
  variant_id: string | null;
  shop_id: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    image_url: string | null;
    unit: string;
    stock: number;
  };
  variant?: {
    id: string;
    name: string | null;
    size: string;
    unit: string | null;
    selling_price: number;
    mrp: number;
    stock: number;
    images: string[];
  } | null;
  shop?: {
    id: string;
    name: string;
    address: string | null;
    pincode: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

export class CartShopConflictError extends Error {
  constructor(
    public currentShopId: string,
    public newShopId: string,
    public currentShopName?: string,
    public newShopName?: string,
  ) {
    super("Cart contains items from a different shop");
    this.name = "CartShopConflictError";
  }
}

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async (): Promise<CartLine[]> => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("cart_items")
        .select(
          "id, product_id, variant_id, shop_id, quantity, products(id, name, slug, price, mrp, image_url, unit, stock), product_variants:variant_id(id, name, size, unit, selling_price, mrp, stock, images), shops:shop_id(id, name, address, pincode, latitude, longitude)"
        )
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? [])
        .filter((row: any) => row.products)
        .map((row: any) => ({
          id: row.id,
          product_id: row.product_id,
          variant_id: row.variant_id ?? null,
          shop_id: row.shop_id ?? null,
          quantity: row.quantity,
          product: row.products,
          variant: row.product_variants ?? null,
          shop: row.shops ?? null,
        }));
    },
    enabled: !!user,
  });

  const items = cartQuery.data ?? [];
  const priceOf = (l: CartLine) => l.variant?.selling_price ?? l.product.price;
  const mrpOf = (l: CartLine) => l.variant?.mrp ?? l.product.mrp;
  const subtotal = items.reduce((s, l) => s + priceOf(l) * l.quantity, 0);
  const mrpTotal = items.reduce((s, l) => s + mrpOf(l) * l.quantity, 0);
  const savings = mrpTotal - subtotal;
  const totalQty = items.reduce((s, l) => s + l.quantity, 0);
  const currentShop = items.find((l) => l.shop)?.shop ?? null;
  const currentShopId = items.find((l) => l.shop_id)?.shop_id ?? null;

  const cartKey = ["cart", user?.id] as const;
  const snapshot = () => qc.getQueryData<CartLine[]>(cartKey) ?? [];
  const setLines = (lines: CartLine[]) => qc.setQueryData<CartLine[]>(cartKey, lines);

  const addMutation = useMutation({
    mutationFn: async ({
      productId,
      variantId = null,
      shopId = null,
      qty = 1,
      force = false,
    }: {
      productId: string;
      variantId?: string | null;
      shopId?: string | null;
      qty?: number;
      force?: boolean;
    }) => {
      if (!user) throw new Error("Please sign in to add to cart");

      // Detect shop conflict
      if (shopId && currentShopId && currentShopId !== shopId && !force) {
        const newShop = (await supabase.from("shops").select("name").eq("id", shopId).maybeSingle()).data;
        throw new CartShopConflictError(
          currentShopId,
          shopId,
          currentShop?.name,
          newShop?.name,
        );
      }

      // If forcing, clear existing cart first (different shop)
      if (force && currentShopId && currentShopId !== shopId) {
        const { error: dErr } = await supabase.from("cart_items").delete().eq("user_id", user.id);
        if (dErr) throw dErr;
      }

      const effectiveShopId = shopId ?? currentShopId;
      const existing = force
        ? undefined
        : items.find(
            (l) =>
              l.product_id === productId &&
              (l.variant_id ?? null) === (variantId ?? null) &&
              (l.shop_id ?? null) === (effectiveShopId ?? null),
          );
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + qty })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          shop_id: effectiveShopId,
          quantity: qty,
        });
        if (error) throw error;
      }
    },
    // Optimistic: bump the quantity of an existing line right away so the
    // quantity stepper / cart badge react instantly.
    onMutate: async (vars) => {
      const previous = snapshot();
      const effectiveShopId = vars.shopId ?? currentShopId;
      const existing = previous.find(
        (l) =>
          l.product_id === vars.productId &&
          (l.variant_id ?? null) === (vars.variantId ?? null) &&
          (l.shop_id ?? null) === (effectiveShopId ?? null),
      );
      if (existing && !vars.force) {
        setLines(
          previous.map((l) =>
            l.id === existing.id ? { ...l, quantity: l.quantity + (vars.qty ?? 1) } : l,
          ),
        );
      }
      return { previous };
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.previous) setLines(ctx.previous);
      if (e.name !== "CartShopConflictError") toast.error(e.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", user?.id] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ lineId, qty }: { lineId: string; qty: number }) => {
      if (qty <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", lineId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").update({ quantity: qty }).eq("id", lineId);
        if (error) throw error;
      }
    },
    onMutate: async ({ lineId, qty }) => {
      const previous = snapshot();
      setLines(
        qty <= 0
          ? previous.filter((l) => l.id !== lineId)
          : previous.map((l) => (l.id === lineId ? { ...l, quantity: qty } : l)),
      );
      return { previous };
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.previous) setLines(ctx.previous);
      toast.error(e.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", user?.id] }),
  });

  const changeShop = async (newShopId: string) => {
    if (!user) return;
    const previous = snapshot();
    // Instant UI: repoint every line at the new shop (single batched update below).
    setLines(previous.map((l) => ({ ...l, shop_id: newShopId, shop: l.shop ? { ...l.shop, id: newShopId } : l.shop })));
    const { error } = await supabase
      .from("cart_items")
      .update({ shop_id: newShopId })
      .eq("user_id", user.id);
    if (error) {
      setLines(previous);
      return toast.error(error.message);
    }
    toast.success("Shop updated");
    qc.invalidateQueries({ queryKey: ["cart", user.id] });
  };

  const clear = async () => {
    if (!user) return;
    const previous = snapshot();
    setLines([]);
    const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
    if (error) {
      setLines(previous);
      toast.error("Could not clear cart: " + error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["cart", user.id] });
  };

  return {
    items,
    subtotal,
    mrpTotal,
    savings,
    totalQty,
    currentShop,
    currentShopId,
    loading: cartQuery.isLoading,
    add: (productId: string, qty = 1, variantId: string | null = null, shopId: string | null = null) =>
      addMutation.mutateAsync({ productId, variantId, shopId, qty }),
    addForce: (productId: string, qty = 1, variantId: string | null = null, shopId: string | null = null) =>
      addMutation.mutateAsync({ productId, variantId, shopId, qty, force: true }),
    setQty: (lineId: string, qty: number) => updateMutation.mutate({ lineId, qty }),
    changeShop,
    clear,
  };
}

