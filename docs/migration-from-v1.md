---
layout: docs
title: Migrating from NexusHub v1.0.0
permalink: /docs/migration-from-v1/
---

# Migrating from NexusHub v1.0.0

NexusHub v2.0.0 is a complete rewrite. Same problem - manage a WireGuard server through a web dashboard - but a different architecture: Go API + React frontend + PostgreSQL + eBPF, instead of the v1 Python WebGUI + flat files.

This document covers what the upgrade requires for an operator running a v1 install today. Most of it is a one-shot data migration; nothing carries forward as-is.

## What's incompatible

| Subsystem | v1 | v2 |
|---|---|---|
| Backend language | Python | Go |
| Web framework | Flask | Gin |
| Frontend | Server-rendered Jinja templates | React + Vite SPA |
| State storage | `wg0.conf` flat files | PostgreSQL 16+ |
| Auth | HTTP basic | JWT + refresh-token rotation + optional TOTP |
| Install path | `wg-server-install.sh` shell script | systemd / Docker / Helm |
| eBPF security rules | None | XDP + TC clsact, runtime-tunable maps |
| API | None | OpenAPI 3.0, CLI, programmatic access |

Because state lived in WireGuard config files in v1, there's no direct database upgrade path. The migration is a one-shot import.

## Plan the cutover

This is a destructive, one-way migration. Schedule a maintenance window, warn peers that they may need to re-scan a QR or re-import a `.conf`, and keep the v1 install runnable on a snapshot for at least a week.

The data the import preserves:

- Server private + public keys.
- Listen port + interface address.
- Peer name, allowed IPs, public key, and pre-shared key if set.

What it doesn't preserve:

- Operator passwords.
- Bandwidth / connection history.
- Per-peer custom settings that lived only in shell scripts.

## Step 1 - Stand up v2 alongside v1

Pick a deployment shape from the [Deployment guide]({{ '/docs/deployment/' | relative_url }}) and bring v2 up on a non-conflicting port or different host. Don't forward the public WireGuard endpoint at v2 yet.

Verify v2 is healthy:

```sh
nexushub doctor
```

## Step 2 - Export v1 state

On the v1 host:

```sh
sudo cat /etc/wireguard/wg0.conf > /tmp/v1-wg0.conf
sudo wg show wg0 dump > /tmp/v1-runtime-state.txt
```

Copy these to wherever you can run the v2 CLI from.

## Step 3 - Import into v2

The v2 CLI doesn't ship a `config import` command yet. For now, import is a manual but mechanical translation:

1. Create the interface with the same private key and listen port.
2. Add each peer preserving its public key and allowed IPs.
3. Verify with `nexushub peer list`.

Example:

```sh
nexushub login
nexushub peer create --interface wg0 \
  --name alice-laptop \
  --ip 10.10.0.2 \
  --allowed-ips 10.10.0.2/32
```

A scripted importer that consumes `/etc/wireguard/wg0.conf` is on the roadmap.

## Step 4 - Cut over

1. Stop the v1 service: `sudo systemctl stop wg-quick@wg0`.
2. Disable autostart: `sudo systemctl disable wg-quick@wg0`.
3. Start the v2 stack with the production listen port.
4. Confirm peers can connect.

If v2 misbehaves, swap back: stop v2, re-enable and start `wg-quick@wg0`.

## Step 5 - Decommission v1

Once you've verified peer connectivity for a few days:

```sh
sudo systemctl stop wg-quick@wg0
sudo systemctl disable wg-quick@wg0
sudo apt purge wireguard-tools
sudo rm -rf /etc/wireguard/
sudo rm /etc/systemd/system/wg-server-*.service /usr/local/bin/wg-server-*
```

Back up anything uncertain before deleting it.

## What to read next

- [User guide]({{ '/docs/user-guide/' | relative_url }})
- [Deployment guide]({{ '/docs/deployment/' | relative_url }})
- [Backup & restore]({{ '/docs/backup-restore/' | relative_url }})
- [API reference]({{ '/docs/api/' | relative_url }})
