import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/customer/home")({ component: () => <Navigate to="/dashboard" /> });
