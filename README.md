# QPub Dashboard

Self-hosted control plane for [qpub-server](https://github.com/qpubio/qpub-server). Operate tenants, API keys, queues, and realtime stats through a terminal-inspired web UI built with [@qpub/qui](https://github.com/qpubio/qui).

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3004](http://localhost:3004). Default credentials (dev): `admin` / `admin`.

Point the dashboard at your Control API:

```env
QPUB_SERVER_CONTROL_URL=http://localhost:8091
CONTROL_API_TOKEN=your-token
```

Or register servers in **Servers** after sign-in. Control tokens are stored encrypted in SQLite (`DASHBOARD_DATA_DIR`).

## Docker

```bash
docker compose up --build
```

## Environment

| Variable                                            | Purpose                                                     |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `DASHBOARD_SECRET`                                  | Session signing + token encryption (required in production) |
| `DASHBOARD_ADMIN_USER` / `DASHBOARD_ADMIN_PASSWORD` | Built-in admin login                                        |
| `DASHBOARD_ADMIN_PASSWORD_HASH`                     | Bcrypt hash instead of plaintext password                   |
| `DASHBOARD_DATA_DIR`                                | SQLite registry path (default `./data`)                     |
| `QPUB_SERVERS`                                      | JSON array to seed multiple servers on first boot           |

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
