import { Outlet, useRouterState } from "@tanstack/react-router";
import { Header } from "./Header";
import { Toaster } from "./ui/sonner";
import { useNotifications } from "@/hooks/useNotifications";

const DEMO_PREFIXES = ["/customer", "/shopkeeper", "/delivery", "/admin", "/login", "/signup"];

export function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useNotifications();
  const isDemo = DEMO_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname === p);

  if (isDemo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Outlet />
        <Toaster richColors closeButton position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>© {new Date().getFullYear()} FlashBasket. Groceries delivered at lightning speed.</div>
            <div className="flex gap-4">
              <span>About</span><span>Help</span><span>Privacy</span><span>Terms</span>
            </div>
          </div>
        </div>
      </footer>
      <Toaster richColors closeButton position="top-center" />
    </div>
  );
}
