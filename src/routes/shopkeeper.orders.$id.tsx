import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/shopkeeper/orders/$id")({ component: () => <Navigate to="/shopkeeper/dashboard" /> });
