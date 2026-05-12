---
layout: docs
title: NexusHub user guide
permalink: /docs/user-guide/
---

# NexusHub user guide

For administrators running NexusHub day-to-day. Operator install guides live separately under [Deployment guide]({{ '/docs/deployment/' | relative_url }}); this guide assumes you already have a running instance and an admin password.

## Contents

1. [First login](#1-first-login)
2. [Creating your first WireGuard interface](#2-creating-your-first-wireguard-interface)
3. [Adding a peer](#3-adding-a-peer)
4. [eBPF security rules](#4-ebpf-security-rules)
5. [Two-factor authentication](#5-two-factor-authentication)
6. [Audit log + observability](#6-audit-log--observability)
7. [Backup and restore](#7-backup-and-restore)

## 1. First login

Open the dashboard URL - `https://<your-host>` for a Caddy/Helm deploy, or `http://localhost:8080` if you port-forwarded - and sign in with the seeded super-admin credentials.

If you didn't seed yet, the bare-metal install command is:

```sh
sudo -u nexushub /usr/local/bin/nexushub-seed
```

with `NEXUSHUB_ADMIN_EMAIL`, `NEXUSHUB_ADMIN_USERNAME`, and `NEXUSHUB_ADMIN_PASSWORD` exported in the env. For Docker/Helm see the deployment guide.

After the first login, change the password from **Security -> Change password**. Seeded passwords often end up in shell history or terraform state; rotate them.

## 2. Creating your first WireGuard interface

NexusHub doesn't ship a default interface - it manages whatever you create explicitly so you stay in control of CIDRs and listen ports.

1. Go to **Interfaces -> New**.
2. Give it a name (`wg0` is the convention but anything matching `[a-z][a-z0-9_-]{0,14}` works).
3. Pick an address (e.g. `10.10.0.1/24`) and a UDP listen port.
4. Save.

The API encrypts the interface private key at rest with `PEER_KEY_ENCRYPTION_KEY` and configures the kernel device through wgctrl. If the kernel sync fails, the row still lands in the database - the reconciler converges on the next restart.

## 3. Adding a peer

1. Open the interface you just created and click **Add peer**.
2. Name the peer. The IP auto-allocates from the interface CIDR; override only when needed.
3. Optional: comma-separated `Allowed IPs`, custom `Endpoint`, and keepalive.
4. Save.

The peer modal opens with the rendered config. Use a QR code for mobile clients or download the raw `wg-quick(8)` config for desktop/server clients.

### CLI alternative

```sh
nexushub peer create --name alice-laptop --interface wg0
nexushub peer create --name bob-phone --interface wg0
nexushub peer list
```

`nexushub peer list` prints a table of peers with status; add `--json` to pipe into `jq`.

## 4. eBPF security rules

Rules live under **Rules** in the sidebar. Each rule has:

- An **action**: `allow`, `deny`, `rate_limit`, or `log`.
- A **direction**: `ingress`, `egress`, or `both`.
- A **protocol**: `tcp`, `udp`, `icmp`, or `any`.
- Optional source and destination CIDRs.
- Optional TCP/UDP source and destination port ranges.
- For `rate_limit`, packets-per-second and optional burst.
- A **priority** and an **active** toggle.

The kernel evaluates rules in descending priority. The first match decides.

### Common patterns

```sh
nexushub rule create --name "block-scanner" --action deny \
  --src 198.51.100.0/24 --priority 800

nexushub rule create --name "icmp-throttle" --action rate_limit \
  --protocol icmp --rate-pps 10 --rate-burst 50 --priority 500

nexushub rule create --name "log-ssh" --action log \
  --protocol tcp --dst-port-from 22 --dst-port-to 22
```

Logged events stream into the `connection_logs` table; query them via the audit log viewer or directly with psql.

## 5. Two-factor authentication

Highly recommended for every admin account.

1. **Security -> Enable 2FA**.
2. Scan the QR code with Google Authenticator, 1Password, Bitwarden, or any RFC 6238 TOTP app.
3. Type the 6-digit code from the app to confirm.

After enabling, login takes two steps: password first, then code. The CLI handles this automatically.

To disable 2FA you need both your password and a current code.

## 6. Audit log + observability

**Audit log** is the append-only record of every authenticated action: logins, logouts, password changes, 2FA enroll/disable, peer creates/deletes, and rule changes. Filter by action, result, or time range. Retention defaults to 90 days.

**Metrics** are exposed at `/api/v1/metrics` for Prometheus scrape. The bundled Grafana dashboard shows HTTP latency, DB pool, eBPF map cardinality, and per-peer WireGuard throughput.

**Tracing** activates when `OTEL_EXPORTER_OTLP_ENDPOINT` is set - HTTP requests and pgx queries land as spans. Disabled means noop.

## 7. Backup and restore

The complete operator runbook is in [Backup & restore]({{ '/docs/backup-restore/' | relative_url }}). Short version:

```sh
./scripts/backup.sh
./scripts/restore.sh <file>
```

Back up the Postgres dump and `PEER_KEY_ENCRYPTION_KEY` separately. Without the encryption key, a DB restore cannot decrypt peer private keys or TOTP secrets.
