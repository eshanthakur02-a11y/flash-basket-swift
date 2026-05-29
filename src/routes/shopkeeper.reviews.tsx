import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { SHOPKEEPER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findUser } from "@/lib/demo/seed";
import { Star } from "lucide-react";

export const Route = createFileRoute("/shopkeeper/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Shopkeeper" }] }),
  component: Page,
});

function Page() {
  const { state } = useDemo();
  const user = findUser(state.currentUserId);
  const reviews = state.orders.filter((o) => o.storeId === user?.storeId && o.rating?.shop);
  const avg = reviews.length ? reviews.reduce((a, b) => a + (b.rating?.shop ?? 0), 0) / reviews.length : 0;
  return (
    <DemoShell role="shopkeeper" nav={SHOPKEEPER_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold">Reviews</h1>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="text-5xl font-extrabold">{avg.toFixed(1)}</div>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= Math.round(avg) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">{reviews.length} reviews</div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {reviews.length === 0 && <div className="text-sm text-muted-foreground">No reviews yet. Customers can rate after delivery.</div>}
          {reviews.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="font-bold text-sm">Order #{o.id}</div>
                <div className="flex gap-0.5 ml-auto">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= (o.rating?.shop ?? 0) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  ))}
                </div>
              </div>
              {o.rating?.comment && <p className="text-sm text-muted-foreground mt-2">{o.rating.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
