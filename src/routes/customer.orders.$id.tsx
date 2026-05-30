import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/customer/orders/$id")({
  component: function R() {
    const { id } = Route.useParams();
    return <Navigate to="/orders/$id" params={{ id }} />;
  },
});
