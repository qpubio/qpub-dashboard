import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { env } from "@/config/env";
import { decryptSecret, encryptSecret } from "@/lib/crypto/secrets";

export type ServerRow = {
  id: string;
  name: string;
  control_url: string;
  control_token_enc: string;
  last_health: string | null;
  last_seen_at: string | null;
  created_at: string;
};

export type AuditRow = {
  id: number;
  severity: string;
  category: string;
  message: string;
  server_id: string | null;
  tenant_id: number | null;
  metadata: string | null;
  created_at: string;
};

let db: Database.Database | null = null;

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      control_url TEXT NOT NULL UNIQUE,
      control_token_enc TEXT NOT NULL,
      last_health TEXT,
      last_seen_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      server_id TEXT,
      tenant_id INTEGER,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedServers(database: Database.Database) {
  const count = database.prepare("SELECT COUNT(*) as c FROM servers").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const insert = database.prepare(`
    INSERT INTO servers (id, name, control_url, control_token_enc)
    VALUES (@id, @name, @control_url, @control_token_enc)
  `);

  if (env.serversJson) {
    try {
      const parsed = JSON.parse(env.serversJson) as Array<{
        id?: string;
        name: string;
        control_url: string;
        control_token: string;
      }>;
      for (const s of parsed) {
        insert.run({
          id: s.id ?? crypto.randomUUID(),
          name: s.name,
          control_url: s.control_url.replace(/\/$/, ""),
          control_token_enc: encryptSecret(
            s.control_token,
            env.dashboardSecret,
          ),
        });
      }
      return;
    } catch {
      // fall through
    }
  }

  if (env.controlUrl) {
    insert.run({
      id: crypto.randomUUID(),
      name: "default",
      control_url: env.controlUrl.replace(/\/$/, ""),
      control_token_enc: encryptSecret(env.controlToken, env.dashboardSecret),
    });
  }
}

/** Apply CONTROL_API_TOKEN / QPUB_SERVER_CONTROL_URL from env on each process start. */
function syncEnvCredentials(database: Database.Database) {
  const token = env.controlToken?.trim();
  const url = env.controlUrl?.replace(/\/$/, "");
  if (!token && !url) return;

  const rows = database.prepare("SELECT * FROM servers").all() as ServerRow[];
  if (rows.length === 0) return;

  let targets: ServerRow[] = [];
  if (url) {
    targets = rows.filter((r) => r.control_url === url);
    if (targets.length === 0) {
      const def = rows.find((r) => r.name === "default");
      if (def) targets = [def];
    }
  } else if (rows.length === 1) {
    targets = rows;
  }

  if (targets.length === 0) return;

  const enc = token ? encryptSecret(token, env.dashboardSecret) : null;
  const updateToken = database.prepare(
    "UPDATE servers SET control_token_enc = ? WHERE id = ?",
  );
  const updateUrl = database.prepare(
    "UPDATE servers SET control_url = ? WHERE id = ?",
  );

  for (const row of targets) {
    if (enc) updateToken.run(enc, row.id);
    if (url && row.control_url !== url) updateUrl.run(url, row.id);
  }
}

export function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(env.dataDir, { recursive: true });
  const file = path.join(env.dataDir, "dashboard.db");
  db = new Database(file);
  migrate(db);
  seedServers(db);
  syncEnvCredentials(db);
  return db;
}

export function listServers(): ServerRow[] {
  return getDb()
    .prepare("SELECT * FROM servers ORDER BY name ASC")
    .all() as ServerRow[];
}

export function getServer(id: string): ServerRow | undefined {
  return getDb().prepare("SELECT * FROM servers WHERE id = ?").get(id) as
    ServerRow | undefined;
}

export function upsertServer(input: {
  id?: string;
  name: string;
  control_url: string;
  control_token?: string;
}): ServerRow {
  const id = input.id ?? crypto.randomUUID();
  const database = getDb();
  const existing = input.id ? getServer(input.id) : undefined;
  const token = input.control_token?.trim();
  if (!token && !existing) {
    throw new Error("control_token required for new server");
  }
  const enc = encryptSecret(
    token || decryptSecret(existing!.control_token_enc, env.dashboardSecret),
    env.dashboardSecret,
  );
  database
    .prepare(
      `INSERT INTO servers (id, name, control_url, control_token_enc)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         control_url = excluded.control_url,
         control_token_enc = excluded.control_token_enc`,
    )
    .run(id, input.name, input.control_url.replace(/\/$/, ""), enc);
  return getServer(id)!;
}

export function deleteServer(id: string) {
  getDb().prepare("DELETE FROM servers WHERE id = ?").run(id);
}

export function updateServerHealth(id: string, health: string) {
  getDb()
    .prepare(
      "UPDATE servers SET last_health = ?, last_seen_at = datetime('now') WHERE id = ?",
    )
    .run(health, id);
}

export function insertAudit(event: Omit<AuditRow, "id" | "created_at">) {
  getDb()
    .prepare(
      `INSERT INTO audit_events (severity, category, message, server_id, tenant_id, metadata)
       VALUES (@severity, @category, @message, @server_id, @tenant_id, @metadata)`,
    )
    .run(event);
}

export function listAudit(limit = 100): AuditRow[] {
  return getDb()
    .prepare("SELECT * FROM audit_events ORDER BY id DESC LIMIT ?")
    .all(limit) as AuditRow[];
}
