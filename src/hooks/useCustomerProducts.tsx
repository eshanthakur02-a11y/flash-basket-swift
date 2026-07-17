import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeliveryContext } from "./useDeliveryContext";
import type { ProductCardData } from "@/components/ProductCard";

export interface CustomerProductsArgs {
  categoryId?: string | null;
  search?: string | null;
  onlyFeatured?: boolean;
  onlyBestseller?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating";
  limit?: number;
  ids?: string[] | null;
  enabled?: boolean;
  key?: string; // extra cache key discriminator
}

/**
 * Fetches products currently available from at least one active shop
 * in the customer's PIN code. Uses list_customer_products RPC so removed
 * or unavailable inventory disappears automatically.
 */
export function useCustomerProducts(args: CustomerProductsArgs = {}) {
  const {
    categoryId = null,
    search = null,
    onlyFeatured = false,
    onlyBestseller = false,
    sort = "relevance",
    limit = 60,
    ids = null,
    enabled = true,
    key,
  } = args;

  const { pincode } = useDeliveryContext();

  return useQuery({
    queryKey: [
      "customer-products",
      pincode,
      categoryId,
      search,
      onlyFeatured,
      onlyBestseller,
      sort,
      limit,
      ids,
      key,
    ],
    enabled: enabled && (ids === null || ids.length > 0),
    queryFn: async (): Promise<ProductCardData[]> => {
      const { data, error } = await (supabase as any).rpc(
        "list_customer_products",
        {
          _pincode: pincode,
          _category_id: categoryId,
          _search: search,
          _only_featured: onlyFeatured,
          _only_bestseller: onlyBestseller,
          _sort: sort,
          _limit: limit,
          _ids: ids,
        },
      );
      if (error) throw error;
      return (data ?? []) as ProductCardData[];
    },
  });
}

/**
 * Subscribe to shop_products / products / shops changes and invalidate
 * customer catalog queries so the UI updates without a manual refresh.
 */
export function useCustomerCatalogRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ["customer-products"] });
      qc.invalidateQueries({ queryKey: ["cat-product-counts"] });
    };
    const ch = supabase
      .channel("customer-catalog")
      .on("postgres_changes", { event: "*", schema: "public", table: "shop_products" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "shops" }, invalidate)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);
}
