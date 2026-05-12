---
layout: docs
title: Backup & Restore
permalink: /docs/backup-restore/
---

# Backup & Restore

NexusHub state lives in Postgres - peers, interfaces, rules, users, sessions, audit log. Everything else reconciles from the database on startup, so a Postgres dump is a complete backup.

## What to back up

| Item | Source | Why |
|---|---|---|
| Postgres database | `pg_dump nexushub` | Every user-facing configuration |
| `PEER_KEY_ENCRYPTION_KEY` | Environment | AEAD master for peer private keys + TOTP secrets. Losing this loses every stored key. Back up separately. |
| `JWT_SECRET` | Environment | Access-token signing. Losing it invalidates all sessions but no user-visible data. |

The WireGuard private keys in the database are encrypted with `PEER_KEY_ENCRYPTION_KEY`. A DB backup without the key is useless for restoring peer configs. Store the key somewhere durable and separate from the DB backup.

## scripts/backup.sh

Auto-detects the deployment shape:

- If `docker/docker-compose.prod.yml` has a running `postgres` service, `pg_dump` runs inside the container.
- Otherwise the script sources `/etc/nexushub/env` and runs host-side `pg_dump` against `$DATABASE_URL`.

```sh
./scripts/backup.sh
sudo ./scripts/backup.sh
./scripts/backup.sh /srv/backups
```

The script keeps the 14 most recent dumps per directory and deletes older ones. For longer retention, plug the backup directory into a rotation tool.

### Scheduling

**systemd timer**:

```ini
# /etc/systemd/system/nexushub-backup.service
[Unit]
Description=NexusHub daily backup

[Service]
Type=oneshot
ExecStart=/opt/nexushub/scripts/backup.sh
```

```ini
# /etc/systemd/system/nexushub-backup.timer
[Unit]
Description=Run nexushub-backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```sh
systemctl enable --now nexushub-backup.timer
```

**cron**:

```text
0 3 * * *  cd /opt/nexushub && ./scripts/backup.sh >> /var/log/nexushub-backup.log 2>&1
```

## scripts/restore.sh

Refuses to overwrite a non-empty database without `--force`:

```sh
./scripts/restore.sh /var/backups/nexushub/nexushub-20260423T030001Z.sql.gz
sudo ./scripts/restore.sh /var/backups/nexushub/nexushub-...-.sql.gz --force
```

After a restore:

1. Confirm `PEER_KEY_ENCRYPTION_KEY` on the target host matches the one used when the dump was taken.
2. Restart the API (`systemctl restart nexushub-api` or `docker compose restart api`).
3. Log in and spot-check a peer config renders.

## Point-in-time recovery

The scripts ship plain `pg_dump` - good enough for nightly snapshots, not enough for sub-daily RPO. For production workloads that care about the last N minutes, run Postgres with WAL archiving or a managed Postgres with automated PITR.

## Disaster recovery drill

Once a quarter, restore the most recent backup into a throwaway environment and confirm:

- `nexushub doctor` reports healthy probes.
- A known peer's `peer get <id>` returns the expected config.
- An audit log query for a recent action shows up.

If any step fails, the backups are not actually working. Fix before you need them.
