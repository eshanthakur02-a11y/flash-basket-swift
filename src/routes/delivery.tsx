import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery — FlashBasket" }] }),
  component: DeliveryLayout,
});

function DeliveryLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === "/delivery" ? <Navigate to="/delivery/dashboard" /> : <Outlet />;
}
