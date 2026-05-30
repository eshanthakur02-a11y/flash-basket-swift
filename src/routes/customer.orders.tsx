import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/customer/orders")({ component: () => <Navigate to="/orders" /> });
