import { createFileRoute } from "@tanstack/react-router";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
export const Route = createFileRoute("/admin/customers")({ component: () => <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}><div className="p-6"><h1 className="font-display text-2xl font-bold">Customers</h1><p className="text-muted-foreground mt-2">Coming soon.</p></div></RoleShell> });
