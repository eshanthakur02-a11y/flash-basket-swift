import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/customer/categories")({
  head: () => ({ meta: [{ title: "Categories — FlashBasket" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [q, setQ] = useState("");
  const categories = useQuery({
    queryKey: ["app-all-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  const filtered = (categories.data ?? []).filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Categories</h1>

      <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 shadow-card">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {categories.isLoading
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
          : filtered.map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-card hover:shadow-glow transition"
              >
                <div
                  className="grid h-14 w-14 place-items-center rounded-2xl text-3xl"
                  style={{ backgroundColor: (c.color ?? "#A3E635") + "55" }}
                >
                  {c.icon}
                </div>
                <div className="text-[11px] font-semibold text-center leading-tight">{c.name}</div>
              </Link>
            ))}
      </div>
    </div>
  );
}
