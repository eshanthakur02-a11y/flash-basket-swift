import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/customer/wishlist")({ component: () => <Navigate to="/account" /> });
