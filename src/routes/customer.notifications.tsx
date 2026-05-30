import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/customer/notifications")({ component: () => <Navigate to="/dashboard" /> });
