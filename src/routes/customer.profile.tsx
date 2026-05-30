import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/customer/profile")({ component: () => <Navigate to="/account" /> });
