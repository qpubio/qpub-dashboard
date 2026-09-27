/** iron-session requires password length ≥ 32 */
export const defaultDashboardSecret =
  "dev-dashboard-secret-change-me-32chars";

export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3004",
  dashboardSecret: process.env.DASHBOARD_SECRET ?? defaultDashboardSecret,
  adminUser: process.env.DASHBOARD_ADMIN_USER ?? "admin",
  adminPasswordHash: process.env.DASHBOARD_ADMIN_PASSWORD_HASH ?? "",
  adminPasswordPlain: process.env.DASHBOARD_ADMIN_PASSWORD ?? "admin",
  dataDir: process.env.DASHBOARD_DATA_DIR ?? "./data",
  controlUrl: process.env.QPUB_SERVER_CONTROL_URL ?? "",
  controlToken: process.env.CONTROL_API_TOKEN ?? "",
  serversJson: process.env.QPUB_SERVERS ?? "",
};
