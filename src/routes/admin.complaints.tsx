import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/admin/complaints")({
  head: () => ({ meta: [{ title: "Support — Admin" }] }),
  component: Page,
});

const TONE: Record<string, string> = {
  open: "bg-destructive/15 text-destructive border-destructive/30",
  in_progress: "bg-warning/30 text-warning-foreground border-warning/40",
  resolved: "bg-success/15 text-success border-success/30",
};

function Page() {
  const { state } = useDemo();
  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">Support tickets</h1>
        <div className="mt-4 rounded-2xl border border-border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left"><tr><th className="px-3 py-2">Ticket</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Order</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Status</th></tr></thead>
            <tbody>
              {state.complaints.map(c => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-2 font-bold">{c.id}</td>
                  <td className="px-3 py-2">{c.customer}</td>
                  <td className="px-3 py-2">#{c.orderId}</td>
                  <td className="px-3 py-2">{c.subject}</td>
                  <td className="px-3 py-2"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${TONE[c.status]}`}>{c.status.replace("_", " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DemoShell>
  );
}
