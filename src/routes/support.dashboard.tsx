import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Inbox, AlertCircle, CheckCircle2, Timer } from "lucide-react";

export const Route = createFileRoute("/support/dashboard")({
  head: () => ({ meta: [{ title: "Support Dashboard — FlashBasket" }] }),
  component: Page,
});

const STATUS_LABEL: Record<string, string> = {
  open: "Open", assigned: "Assigned", in_progress: "In progress",
  resolved: "Resolved", closed: "Closed",
};

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase.channel("support-dash").on("postgres_changes",
      { event: "*", schema: "public", table: "support_tickets" },
      () => qc.invalidateQueries({ queryKey: ["support-tickets-summary"] })
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const summary = useQuery({
    queryKey: ["support-tickets-summary", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("support_tickets")
        .select("id, status, assigned_to, created_at, ticket_number, title, category, role_at_creation")
        .order("created_at", { ascending: false });
      const rows: any[] = data ?? [];
      return {
        total: rows.length,
        open: rows.filter(r => ["open","assigned","in_progress"].includes(r.status)).length,
        unassigned: rows.filter(r => r.status === "open" && !r.assigned_to).length,
        resolved: rows.filter(r => r.status === "resolved").length,
        mine: rows.filter(r => r.assigned_to === user?.id && r.status !== "closed").slice(0, 10),
        queue: rows.filter(r => !r.assigned_to && r.status === "open").slice(0, 10),
      };
    },
    refetchInterval: 15000,
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Support overview</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={<Inbox className="h-4 w-4" />} label="Total" value={summary.data?.total ?? 0} />
        <Stat icon={<Timer className="h-4 w-4" />} label="Open" value={summary.data?.open ?? 0} />
        <Stat icon={<AlertCircle className="h-4 w-4" />} label="Unassigned" value={summary.data?.unassigned ?? 0} />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Resolved" value={summary.data?.resolved ?? 0} />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <TicketList title="Assigned to me" items={summary.data?.mine ?? []} />
        <TicketList title="Unassigned queue" items={summary.data?.queue ?? []} />
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">{icon}{label}</div>
      <div className="font-display text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function TicketList({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-4 py-3 border-b border-border font-bold">{title} <span className="text-xs text-muted-foreground font-normal">({items.length})</span></div>
      {items.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">Nothing here.</div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map(t => (
            <li key={t.id}>
              <Link to="/support/tickets/$id" params={{ id: t.id }} className="block px-4 py-3 hover:bg-secondary/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm truncate">{t.title}</span>
                  <span className="text-[10px] uppercase rounded-full bg-secondary px-2 py-0.5 font-bold">{STATUS_LABEL[t.status]}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span>{t.ticket_number}</span>·<span>{t.category.replace(/_/g, " ")}</span>·<span>{t.role_at_creation}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
