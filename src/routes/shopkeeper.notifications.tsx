import { createFileRoute } from "@tanstack/react-router";
import { RoleShell } from "@/components/RoleShell";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";
export const Route = createFileRoute("/shopkeeper/notifications")({ component: () => <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}><div className="p-6"><h1 className="font-display text-2xl font-bold">Notifications</h1><p className="text-muted-foreground mt-2">No new alerts.</p></div></RoleShell> });
