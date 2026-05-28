import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/shopkeeper")({
  head: () => ({ meta: [{ title: "Shopkeeper — FlashBasket" }] }),
  component: () => <Navigate to="/shopkeeper/dashboard" />,
});
