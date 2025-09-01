#!/usr/bin/env bash
set -euo pipefail

echo "==> Supabase v2 pipeline starting"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI not found in PATH. Please install it and rerun." >&2
  exit 1
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" || -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF env vars." >&2
  exit 2
fi

echo "==> Supabase login"
echo "$SUPABASE_ACCESS_TOKEN" | supabase login --token-env SUPABASE_ACCESS_TOKEN >/dev/null

echo "==> Link project ${SUPABASE_PROJECT_REF}"
supabase link --project-ref "$SUPABASE_PROJECT_REF" >/dev/null

echo "==> Backup before migration"
supabase db dump > "backup_$(date +%Y%m%d%H%M%S).sql"

echo "==> Pull current schema"
supabase db pull >/dev/null || true

echo "==> Dry-run push"
supabase db push --dry-run

echo "==> Push migration"
supabase db push

echo "==> Status"
supabase db status || true

if [[ -f supabase/seed.sql ]]; then
  echo "==> Seeding"
  supabase db seed --file supabase/seed.sql || true
fi

echo "==> Dump after migration"
supabase db dump > "backup_after_$(date +%Y%m%d%H%M%S).sql"

echo "==> Done"

