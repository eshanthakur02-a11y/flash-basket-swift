import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { TICKET_CATEGORIES } from "@/components/SupportTicketForm";

export const Route = createFileRoute("/support/tickets")({
  head: () => ({ meta: [{ title: "Support Tickets — FlashBasket" }] }),
  component: Page,
});

const STATUSES = ["all","open","assigned","in_progress","resolved","closed"] as const;
const ROLES = ["all","customer","shopkeeper","delivery"] as const;

function Page() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("all");
  const [role, setRole] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const ch = supabase.channel("support-tickets-list").on("postgres_changes",
      { event: "*", schema: "public", table: "support_tickets" },
      () => qc.invalidateQueries({ queryKey: ["support-tickets-list"] })
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const tickets = useQuery({
    queryKey: ["support-tickets-list", status, role, cat],
    queryFn: async () => {
      let qb = (supabase as any).from("support_tickets")
        .select("id, ticket_number, title, status, category, role_at_creation, assigned_to, created_at")
        .order("created_at", { ascending: false }).limit(200);
      if (status !== "all") qb = qb.eq("status", status);
      if (role !== "all") qb = qb.eq("role_at_creation", role);
      if (cat !== "all") qb = qb.eq("category", cat);
      const { data } = await qb;
      return (data ?? []) as any[];
    },
    refetchInterval: 15000,
  });

  const filtered = (tickets.data ?? []).filter(t =>
    !q.trim() ||
    t.title.toLowerCase().includes(q.toLowerCase()) ||
    t.ticket_number.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Tickets</h1>

      <div className="grid gap-2 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or number" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>{ROLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">all</SelectItem>
            {TICKET_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No tickets match.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map(t => (
              <li key={t.id}>
                <Link to="/support/tickets/$id" params={{ id: t.id }} className="block p-4 hover:bg-secondary/40">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t.ticket_number} · {t.category.replace(/_/g, " ")} · {t.role_at_creation} · {new Date(t.created_at).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase rounded-full bg-secondary px-2 py-0.5 font-bold">{t.status.replace(/_/g, " ")}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
