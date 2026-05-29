import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { NotificationBell } from "./NotificationBell";
import { useDemo } from "@/lib/demo/store";
import type { Role } from "@/lib/demo/types";
import { findUser } from "@/lib/demo/seed";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  to: string;
  label: string;
  icon: any;
}

export function DemoShell({
  role,
  nav,
  mobileNav,
  children,
}: {
  role: Role;
  nav: NavItem[];
  mobileNav?: NavItem[];
  children?: ReactNode;
}) {
  const { state, switchRole, hydrated } = useDemo();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = findUser(state.currentUserId);

  // Auto-pick a user matching role if mismatch — but only AFTER localStorage has hydrated,
  // otherwise we clobber the signed-in user during the first render.
  useEffect(() => {
    if (!hydrated) return;
    if (state.role !== role) {
      switchRole(role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, hydrated]);

  const useSidebar = role === "shopkeeper" || role === "admin";
  const bottomNav = mobileNav ?? nav;

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
          {useSidebar && (
            <button
              onClick={() => navigate({ to: role === "admin" ? "/admin/dashboard" : "/shopkeeper/dashboard" })}
              className="md:hidden p-2"
              aria-label="menu"
            >
              <Logo size="sm" />
            </button>
          )}
          <Link to={role === "admin" ? "/admin/dashboard" : role === "shopkeeper" ? "/shopkeeper/dashboard" : role === "delivery" ? "/delivery/dashboard" : "/customer/home"} className="hidden md:block">
            <Logo />
          </Link>
          <div className="flex-1" />
          <NotificationBell role={role} />
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary/20 text-foreground text-xs font-bold">
              {user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] flex">
        {/* Sidebar */}
        {useSidebar && (
          <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-card/40 min-h-[calc(100vh-65px)] sticky top-[65px]">
            <nav className="p-3 space-y-1">
              {nav.map((n) => {
                const active = pathname === n.to || pathname.startsWith(n.to + "/");
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      active ? "bg-foreground text-background" : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto p-4 m-3 rounded-2xl bg-primary/10 border border-primary/30 text-xs">
              <div className="font-bold mb-1">Demo Mode</div>
              <div className="text-muted-foreground">Switch roles from the top-right Demo control.</div>
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0 pb-24 md:pb-8">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border">
        <div className="grid grid-cols-5">
          {bottomNav.slice(0, 5).map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
