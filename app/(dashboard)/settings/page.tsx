import { PageHeader } from "@/components/shared/PageHeader";
import { env } from "@/config/env";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Environment-backed configuration for this dashboard instance."
      />
      <dl className="max-w-xl space-y-3 border border-border p-4 font-mono text-sm">
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
          tokens are stored encrypted in SQLite.
        </p>
      </dl>
    </div>
  );
}
