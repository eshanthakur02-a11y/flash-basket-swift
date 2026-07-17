import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CartLine {
  id: string;
  product_id: string;
  variant_id: string | null;
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
        .select("id, product_id, variant_id, quantity, products(id, name, slug, price, mrp, image_url, unit, stock), product_variants:variant_id(id, name, size, unit, selling_price, mrp, stock, images)")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? [])
        .filter((row: any) => row.products)
        .map((row: any) => ({
          id: row.id,
          product_id: row.product_id,
          variant_id: row.variant_id ?? null,
          quantity: row.quantity,
          product: row.products,
          variant: row.product_variants ?? null,
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

  const addMutation = useMutation({
    mutationFn: async ({ productId, variantId = null, qty = 1 }: { productId: string; variantId?: string | null; qty?: number }) => {
      if (!user) throw new Error("Please sign in to add to cart");
      const existing = items.find((l) => l.product_id === productId && (l.variant_id ?? null) === (variantId ?? null));
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + qty })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("cart_items")
          .insert({ user_id: user.id, product_id: productId, variant_id: variantId, quantity: qty });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", user?.id] }),
    onError: (e: Error) => toast.error(e.message),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", user?.id] }),
  });

  const clear = async () => {
    if (!user) return;
    const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
    if (error) { toast.error("Could not clear cart: " + error.message); return; }
    qc.invalidateQueries({ queryKey: ["cart", user.id] });
  };

  return {
    items,
    subtotal,
    mrpTotal,
    savings,
    totalQty,
    loading: cartQuery.isLoading,
    add: (productId: string, qty = 1) => addMutation.mutate({ productId, qty }),
    setQty: (lineId: string, qty: number) => updateMutation.mutate({ lineId, qty }),
    clear,
  };
}
