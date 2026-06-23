#!/usr/bin/env bash
# Seed the ledger with demo parties and initial contracts via Daml Script.
# Requires the DAR to be deployed first (./scripts/deploy.sh).
set -euo pipefail

LEDGER_HOST="${LEDGER_HOST:-localhost}"
LEDGER_PORT="${LEDGER_PORT:-5011}"

echo "Initialising Lex ledger with demo data..."

daml script \
  --dar target/lex-private-credit-0.0.1.dar \
  --script-name Test.Setup:bootstrapPlatform \
  --ledger-host "${LEDGER_HOST}" \
  --ledger-port "${LEDGER_PORT}" \
  --input-file scripts/demo-parties.json

echo "✓ Demo ledger initialised"
echo "  Open the frontend: http://localhost:3000"
