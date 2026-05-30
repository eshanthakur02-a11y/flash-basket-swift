import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/customer/cart")({ component: () => <Navigate to="/cart" /> });
