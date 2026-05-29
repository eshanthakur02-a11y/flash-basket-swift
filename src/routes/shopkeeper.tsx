import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/shopkeeper")({
  head: () => ({ meta: [{ title: "Shopkeeper — FlashBasket" }] }),
  component: ShopkeeperLayout,
});

function ShopkeeperLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === "/shopkeeper" ? <Navigate to="/shopkeeper/dashboard" /> : <Outlet />;
}
