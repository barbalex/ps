#!/usr/bin/env bash
# Deploy the backend: rsync backend/ → /root/ps on the production VM, rebuild
# changed images, restart, and probe the public endpoints.
#
# The VM address is deliberately kept out of this public repo: PS_DEPLOY_SERVER
# (user@host) must be set — a gitignored ./.deploy-backend.env is sourced first
# so plain ./deploy-backend.sh works on the owner's machine, and the Deploy
# backend workflow passes it via a repo secret. Run remotely with
# `npm run deploy-backend` (see scripts/deploy-backend.mjs).
#
# Usage:
#   ./deploy-backend.sh                 # sync + rebuild + restart (data survives)
#   ./deploy-backend.sh --from-scratch  # additionally wipe the ps_pg_data volume
#                                       # so all init scripts re-run (data loss!
#                                       # interactive-only, refused under CI)
#   ./deploy-backend.sh --no-cache      # pass --no-cache to docker compose build
#
# The remote dir can be overridden for testing:
#   PS_DEPLOY_DIR=/path ./deploy-backend.sh

set -euo pipefail

FROM_SCRATCH=0
NO_CACHE=()
for arg in "$@"; do
  case "$arg" in
    --from-scratch) FROM_SCRATCH=1 ;;
    --no-cache) NO_CACHE+=(--no-cache) ;;
    -h|--help) sed -n '2,/^$/{s/^# \{0,1\}//p}' "$0"; exit 0 ;;
    *) echo "unknown argument: $arg (see --help)" >&2; exit 2 ;;
  esac
done

cd "$(dirname "$0")"

# owner convenience: gitignored local defaults for PS_DEPLOY_SERVER etc.
if [ -f .deploy-backend.env ]; then
  . ./.deploy-backend.env
fi
SERVER="${PS_DEPLOY_SERVER:?PS_DEPLOY_SERVER (user@host) must be set — see .deploy-backend.env or .github/workflows/deploy-backend.yml}"
REMOTE_DIR="${PS_DEPLOY_DIR:-/root/ps}"

# production has no backup pipeline — the destructive mode stays a deliberate,
# interactive owner action (the read prompt below would abort under CI anyway)
if [ "$FROM_SCRATCH" = 1 ] && [ "${CI:-}" = true ]; then
  echo "error: --from-scratch wipes the production database and is interactive-only — run it over SSH, never from CI" >&2
  exit 2
fi

# must comfortably exceed the db healthcheck's 180s start_period so a
# from-scratch init (initdb + ~20 seed scripts) fits inside the wait
WAIT_TIMEOUT=300

command -v rsync >/dev/null || { echo "error: rsync is required" >&2; exit 1; }

echo "==> syncing backend/ to $SERVER:$REMOTE_DIR"
# --delete keeps the server from accumulating stale files (a drifted
# 11b_seedApfloraExampleData.sql once broke a from-scratch rebuild). The
# excludes protect BOTH sides: local secrets/node_modules are never shipped,
# and rsync never deletes excluded files on the receiver, so the server's
# .env survives --delete.
rsync -az --delete \
  --exclude '.env*' \
  --exclude 'node_modules/' \
  --exclude '.DS_Store' \
  backend/ "$SERVER:$REMOTE_DIR/"

# -n keeps this pre-check from stealing stdin — without it a piped answer
# to the --from-scratch prompt below is consumed here and read aborts the
# script under set -e
ssh -n "$SERVER" "test -f $REMOTE_DIR/.env" \
  || { echo "error: $REMOTE_DIR/.env missing on the server — restore it first" >&2; exit 1; }

echo "==> deploying $(git rev-parse --short HEAD)$(git diff --quiet -- backend/ || echo ' + UNCOMMITTED backend/ changes')"

if [ "$FROM_SCRATCH" = 1 ]; then
  read -r -p "--from-scratch wipes the production database volume. Continue? [y/N] " answer
  case "$answer" in
    y|Y|yes|YES) ;;
    *) echo "aborted" >&2; exit 1 ;;
  esac
  # caddy_data is kept on purpose: wiping it forces re-issuing all TLS certs
  ssh "$SERVER" "cd $REMOTE_DIR && docker compose down --remove-orphans && docker volume rm -f ps_pg_data"
fi

echo "==> building and starting"
ssh "$SERVER" "cd $REMOTE_DIR && docker compose build ${NO_CACHE[@]+"${NO_CACHE[@]}"} && docker compose up -d --force-recreate --wait --wait-timeout $WAIT_TIMEOUT"

echo "==> probing public endpoints"
probe() { # $1 url  $2 expected status  $3 label
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$1") || status=000
  if [ "$status" = "$2" ]; then
    echo "    ok    $3 ($status)"
  else
    echo "    FAIL  $3 (got $status, want $2)" >&2
    FAILED=1
  fi
}
probe https://api.promote-species.app/ 200 "postgrest openapi root"
probe https://auth.promote-species.app/health 200 "auth health"
probe 'https://sync.promote-species.app/v1/shape?table=users' 401 "electric, unauthenticated"
[ "${FAILED:-0}" -eq 0 ] || { echo "error: endpoint probes failed" >&2; exit 1; }

echo "==> deploy complete"
