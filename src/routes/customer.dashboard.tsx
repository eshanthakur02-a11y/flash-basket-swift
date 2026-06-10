import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/dashboard")({
  head: () => ({ meta: [{ title: "Customer — FlashBasket" }] }),
  component: () => <Navigate to="/customer/home" replace />,
});
