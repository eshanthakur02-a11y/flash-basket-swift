import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Order, OrderStatus, Role } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const ROLE_STAGES: Record<Role, { key: OrderStatus; label: string }[]> = {
  customer: [
    { key: "placed", label: "Placed" },
    { key: "shop_accepted", label: "Shop Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "partner_assigned", label: "Partner Assigned" },
    { key: "out_for_delivery", label: "On the Way" },
    { key: "delivered", label: "Delivered" },
  ],
  shopkeeper: [
    { key: "waiting_shop", label: "Received" },
    { key: "shop_accepted", label: "Accepted" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "picked_up", label: "Picked Up" },
    { key: "delivered", label: "Delivered" },
  ],
  delivery: [
    { key: "ready", label: "Available" },
    { key: "partner_assigned", label: "Accepted" },
    { key: "partner_at_shop", label: "At Store" },
    { key: "picked_up", label: "Picked Up" },
    { key: "out_for_delivery", label: "Delivering" },
    { key: "delivered", label: "Done" },
  ],
  admin: [
    { key: "placed", label: "Placed" },
    { key: "shop_accepted", label: "Accepted" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "picked_up", label: "Picked Up" },
    { key: "delivered", label: "Delivered" },
  ],
};

const ORDER_SEQ: OrderStatus[] = [
  "placed", "waiting_shop", "shop_accepted", "preparing", "ready",
  "finding_partner", "partner_assigned", "partner_at_shop", "picked_up", "out_for_delivery", "delivered",
];

function stageIdx(status: OrderStatus, stages: OrderStatus[]) {
  const current = ORDER_SEQ.indexOf(status);
  let idx = -1;
  stages.forEach((s, i) => {
    if (ORDER_SEQ.indexOf(s) <= current) idx = i;
  });
  return idx;
}

export function OrderTimeline({
  order,
  role = "customer",
  orientation = "horizontal",
}: {
  order: Order;
  role?: Role;
  orientation?: "horizontal" | "vertical";
}) {
  const stages = ROLE_STAGES[role];
  const activeIdx = stageIdx(order.status, stages.map((s) => s.key));
  const isCancelled = ["rejected_by_shop", "cancelled_by_customer", "refund_initiated"].includes(order.status);

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm font-semibold">
        {order.status === "rejected_by_shop" ? "Order was rejected by the shop." : order.status === "refund_initiated" ? "Refund initiated for this cancelled order." : "This order was cancelled."}
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <ol className="space-y-3">
        {stages.map((s, i) => {
          const done = i <= activeIdx;
          const isCurrent = i === activeIdx;
          return (
            <li key={s.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{ scale: isCurrent ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 1.4, repeat: isCurrent ? Infinity : 0 }}
                  className={cn(
                    "h-7 w-7 rounded-full grid place-items-center border-2",
                    done ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                </motion.div>
                {i < stages.length - 1 && <div className={cn("w-0.5 flex-1 mt-1", done && i < activeIdx ? "bg-primary" : "bg-border")} style={{ minHeight: 24 }} />}
              </div>
              <div className="pb-3">
                <div className={cn("text-sm font-bold", done ? "text-foreground" : "text-muted-foreground")}>{s.label}</div>
                {isCurrent && <div className="text-xs text-muted-foreground">Currently in progress</div>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="flex items-center w-full">
      {stages.map((s, i) => {
        const done = i <= activeIdx;
        const isCurrent = i === activeIdx;
        return (
          <div key={s.key} className="flex-1 flex flex-col items-center min-w-0">
            <div className="flex items-center w-full">
              <div className={cn("h-1 flex-1", i === 0 ? "bg-transparent" : done ? "bg-primary" : "bg-border")} />
              <motion.div
                initial={false}
                animate={{ scale: isCurrent ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 1.4, repeat: isCurrent ? Infinity : 0 }}
                className={cn(
                  "h-7 w-7 rounded-full grid place-items-center border-2 shrink-0",
                  done ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground",
                )}
              >
                {done && !isCurrent ? <Check className="h-4 w-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
              </motion.div>
              <div className={cn("h-1 flex-1", i === stages.length - 1 ? "bg-transparent" : i < activeIdx ? "bg-primary" : "bg-border")} />
            </div>
            <div className={cn("mt-2 text-[11px] font-semibold text-center truncate w-full", done ? "text-foreground" : "text-muted-foreground")}>
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
