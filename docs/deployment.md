---
layout: docs
title: Deployment guide
permalink: /docs/deployment/
---

# Deployment guide

Three supported deployment shapes. Pick whichever fits your operational story; you can switch later. The database is the only piece of state, and `scripts/backup.sh` makes a clean dump.

| Target | When to use it | Entry point |
|---|---|---|
| Docker Compose | Single host, fast iteration, Caddy + ACME for TLS | `docker/docker-compose.prod.yml` |
| Bare-metal / VM | Single host, no Docker, system-managed Postgres + WireGuard | `scripts/install.sh` |
| Kubernetes (Helm) | Cluster, externally-managed Postgres, GitOps-friendly | `deploy/helm/nexushub/README.md` |

Common to all three:

- An operator-supplied Postgres 16+. The chart and compose stack ship without an embedded database - getting Postgres right is its own concern.
- Two secrets generated out-of-band:

  ```sh
  JWT_SECRET=$(openssl rand -base64 48)
  PEER_KEY_ENCRYPTION_KEY=$(openssl rand -base64 32)
  ```

  `PEER_KEY_ENCRYPTION_KEY` encrypts WireGuard private keys + TOTP secrets at rest. Losing it makes the database backup useless for restoring peer configs. Back it up separately.

## 1. Docker Compose

Best for single-host installs with TLS and a low-friction operator experience. The stack runs four containers: Postgres, the API, a one-shot init container that copies the SPA bundle out of the API image into a shared volume, and Caddy terminating TLS with auto-provisioned ACME certificates.

```sh
cp docker/.env.example docker/.env
# edit docker/.env - fill in NEXUSHUB_HOST, POSTGRES_PASSWORD,
# JWT_SECRET, PEER_KEY_ENCRYPTION_KEY, WG_ENDPOINT
docker compose -f docker/docker-compose.prod.yml up -d
```

Point DNS at the host before the first start so Caddy can satisfy the HTTP-01 challenge. The Caddyfile is tuned for SPA deep-links and aggressive cache headers on content-hashed `/assets/*`.

Migrations run automatically on first API start via the embedded `/app/nexushub-migrate up` invocation. Seed the first admin with the `nexushub-seed` binary that ships in the same image:

```sh
docker compose -f docker/docker-compose.prod.yml exec \
  -e NEXUSHUB_ADMIN_EMAIL=admin@example.com \
  -e NEXUSHUB_ADMIN_USERNAME=admin \
  -e NEXUSHUB_ADMIN_PASSWORD="$(openssl rand -base64 24)" \
  api /app/nexushub-seed
```

## 2. Bare-metal install

For operators who run WireGuard on the host already and want NexusHub to manage it without Docker in the picture.

```sh
curl -fsSL https://raw.githubusercontent.com/tomeksdev/NexusHub/main/scripts/install.sh \
  | sudo NEXUSHUB_VERSION=v2.0.0 bash
```

What the script does:

- Installs `postgresql`, `wireguard-tools`, `iproute2`, and `curl` via apt.
- Creates the `nexushub` system user and state/log/config directories.
- Bootstraps an empty Postgres database and role.
- Downloads the requested release tarball and installs `/usr/local/bin/nexushub-api`.
- Drops the systemd unit and `/etc/nexushub/env` template.
- Enables, but does not start, the unit.

Then:

```sh
sudo $EDITOR /etc/nexushub/env
sudo -u nexushub /usr/local/bin/nexushub-api migrate up
sudo -u nexushub /usr/local/bin/nexushub-api seed
sudo systemctl start nexushub-api
```

The unit runs as `nexushub:nexushub` with `AmbientCapabilities=CAP_NET_ADMIN+CAP_BPF+CAP_NET_RAW`, `ProtectSystem=strict`, `ProtectHome=yes`, and a 20 s graceful SIGTERM window.

## 3. Helm (Kubernetes)

For multi-tenant clusters and GitOps shops. The chart deploys the API only; bring your own Postgres.

```sh
helm install nexushub ./deploy/helm/nexushub \
  --namespace nexushub --create-namespace \
  --set postgres.url="postgres://nexushub:pw@db:5432/nexushub?sslmode=require" \
  --set secrets.jwtSecret="$JWT_SECRET" \
  --set secrets.peerKeyEncryptionKey="$PEER_KEY_ENCRYPTION_KEY"
```

Production deployments should pre-create Secrets and reference them via `secrets.existingSecret` and `postgres.existingSecret`.

The chart leaves kernel-side WireGuard + eBPF sync off by default (`dataPlane.enabled: false`). Enabling it requires `hostNetwork` plus privileged capabilities. The recommended pattern is API in Kubernetes plus systemd on WireGuard hosts.

## Day-2 operations

| Topic | Doc |
|---|---|
| Backup + restore + DR drill | [Backup & restore]({{ '/docs/backup-restore/' | relative_url }}) |
| Prometheus + Grafana + alerts | [Observability]({{ '/docs/observability/' | relative_url }}) |
| Load testing baseline | [Load testing]({{ '/docs/load-testing/' | relative_url }}) |

## Choosing a tag

`latest` tracks the most recent push to `main`. Production should pin to a semver tag. Both the Docker image and the Helm chart honour the version you supply, and `goreleaser` produces release artefacts on every tag push.
