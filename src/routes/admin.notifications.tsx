import { createFileRoute } from "@tanstack/react-router";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
import { OneSignalDiagnostics } from "@/components/OneSignalDiagnostics";

export const Route = createFileRoute("/admin/notifications")({
  component: () => (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Verify push delivery and inspect OneSignal state.</p>
        </div>
        <OneSignalDiagnostics />
      </div>
    </RoleShell>
  ),
});
