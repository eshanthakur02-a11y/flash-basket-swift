import { Bell, Check, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/demo/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell({ role }: { role: Role }) {
  const { state, markNotificationRead, markAllRead } = useDemo();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = state.notifications.filter((n) => n.role === role && (filter === "all" || !n.read));
  const unread = state.notifications.filter((n) => n.role === role && !n.read).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold grid place-items-center">
              {unread}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            Notifications
            <Button variant="ghost" size="sm" onClick={() => markAllRead(role)} className="text-xs">
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
            </Button>
          </SheetTitle>
          <div className="flex gap-2 pt-2">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full font-semibold ${filter === f ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}
              >
                {f === "all" ? "All" : `Unread (${unread})`}
              </button>
            ))}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-auto">
          {list.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">You're all caught up 🎉</div>
          ) : (
            list.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b cursor-pointer hover:bg-secondary/40 ${!n.read ? "bg-primary/5" : ""}`}
                onClick={() => markNotificationRead(n.id)}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.at)}</div>
                  </div>
                  {n.read && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
