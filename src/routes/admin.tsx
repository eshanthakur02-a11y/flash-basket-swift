import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FlashBasket" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === "/admin" ? <Navigate to="/admin/dashboard" /> : <Outlet />;
}
