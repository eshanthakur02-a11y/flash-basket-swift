import { STATUS_LABELS } from "@/lib/demo/seed";
import type { OrderStatus } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  delivered: "bg-success/15 text-success border-success/30",
  out_for_delivery: "bg-primary/15 text-foreground border-primary/40",
  picked_up: "bg-primary/15 text-foreground border-primary/40",
  partner_assigned: "bg-primary/15 text-foreground border-primary/40",
  partner_at_shop: "bg-primary/15 text-foreground border-primary/40",
  ready: "bg-accent text-accent-foreground border-accent/60",
  preparing: "bg-accent text-accent-foreground border-accent/60",
  shop_accepted: "bg-accent text-accent-foreground border-accent/60",
  finding_partner: "bg-warning/30 text-warning-foreground border-warning/40",
  placed: "bg-muted text-foreground border-border",
  waiting_shop: "bg-muted text-foreground border-border",
  rejected_by_shop: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled_by_customer: "bg-destructive/15 text-destructive border-destructive/30",
  payment_failed: "bg-destructive/15 text-destructive border-destructive/30",
  refund_initiated: "bg-warning/30 text-warning-foreground border-warning/40",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap",
        TONE[status] ?? "bg-muted border-border",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
