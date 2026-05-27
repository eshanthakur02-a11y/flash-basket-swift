import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CartLine {
  id: string;
  product_id: string;
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
}

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async (): Promise<CartLine[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity, products(id, name, slug, price, mrp, image_url, unit, stock)")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? [])
        .filter((row: any) => row.products)
        .map((row: any) => ({
          id: row.id,
          product_id: row.product_id,
          quantity: row.quantity,
          product: row.products,
        }));

    },
    enabled: !!user,
  });

  const items = cartQuery.data ?? [];
  const subtotal = items.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const mrpTotal = items.reduce((s, l) => s + l.product.mrp * l.quantity, 0);
  const savings = mrpTotal - subtotal;
  const totalQty = items.reduce((s, l) => s + l.quantity, 0);

  const addMutation = useMutation({
    mutationFn: async ({ productId, qty = 1 }: { productId: string; qty?: number }) => {
      if (!user) throw new Error("Please sign in to add to cart");
      const existing = items.find((l) => l.product_id === productId);
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + qty })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: user.id, product_id: productId, quantity: qty });
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
    await supabase.from("cart_items").delete().eq("user_id", user.id);
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
