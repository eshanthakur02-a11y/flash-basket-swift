import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FlashBasket" }] }),
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const { user, loading, roles } = useAuth() as any;
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", replace: true }); return; }
    const r: string[] = roles ?? [];
    if (r.includes("shopkeeper")) navigate({ to: "/shopkeeper/dashboard", replace: true });
    else if (r.includes("delivery")) navigate({ to: "/delivery/dashboard", replace: true });
  }, [user, loading, roles, navigate]);

  if (loading || !user) return null;
  const r: string[] = roles ?? [];
  if (r.includes("shopkeeper") || r.includes("delivery")) return null;
  return <Navigate to="/customer/home" replace />;
}
