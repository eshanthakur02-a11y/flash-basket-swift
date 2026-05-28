import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { SHOPKEEPER_NAV } from "@/lib/demo/nav";
import { PRODUCTS, findUser } from "@/lib/demo/seed";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/shopkeeper/products")({
  head: () => ({ meta: [{ title: "Products — Shopkeeper" }] }),
  component: Page,
});

function Page() {
  const user = findUser((typeof window !== "undefined" && localStorage.getItem("fb_demo_state_v1")) ? JSON.parse(localStorage.getItem("fb_demo_state_v1")!).currentUserId : "s1");
  const items = PRODUCTS.filter(p => p.storeId === (user?.storeId ?? "store1"));
  return (
    <DemoShell role="shopkeeper" nav={SHOPKEEPER_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">Products</h1>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(p => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="aspect-square rounded-xl bg-secondary grid place-items-center text-5xl">{p.image}</div>
              <div className="mt-2 font-bold text-sm">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.weight} · stock {p.stock}</div>
              <div className="mt-1 font-extrabold">{rupees(p.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
