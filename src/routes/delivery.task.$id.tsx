import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/delivery/task/$id")({ component: () => <Navigate to="/delivery/dashboard" /> });
