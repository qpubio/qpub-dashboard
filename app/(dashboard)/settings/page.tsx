import { PageHeader } from "@/components/shared/PageHeader";
import { ThemeToggle } from "@/components/shared/layout/ThemeToggle";
import { env } from "@/config/env";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Environment-backed configuration for this dashboard instance."
      />
      <div className="mb-6 max-w-xl border border-border p-4">
        <ThemeToggle />
      </div>
      <dl className="max-w-xl space-y-3 border border-border p-4 font-mono text-sm text-foreground">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Data directory</dt>
          <dd>{env.dataDir}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Admin user</dt>
          <dd>{env.adminUser}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">App URL</dt>
          <dd>{env.appUrl}</dd>
        </div>
        <p className="pt-2 text-xs text-muted">
          Rotate credentials via DASHBOARD_ADMIN_PASSWORD_HASH and DASHBOARD_SECRET. Control API
          tokens are stored encrypted in SQLite. When CONTROL_API_TOKEN or QPUB_SERVER_CONTROL_URL
          change in .env, restart the dashboard to sync them into the server registry (or edit under
          Servers).
        </p>
      </dl>
    </div>
  );
}
