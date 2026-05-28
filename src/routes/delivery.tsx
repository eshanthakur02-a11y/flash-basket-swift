import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery — FlashBasket" }] }),
  component: () => <Navigate to="/delivery/dashboard" />,
});
