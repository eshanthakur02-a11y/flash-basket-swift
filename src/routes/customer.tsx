import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Customer — FlashBasket" }] }),
  component: CustomerLayout,
});

function CustomerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === "/customer" ? <Navigate to="/customer/home" /> : <Outlet />;
}
