#!/usr/bin/env bash
# Build and deploy Lex to a running Canton node.
set -euo pipefail

echo "Building Lex DAR..."
daml build

echo "Running Daml tests..."
daml test --files daml/Test/LoanLifecycle.daml

echo "Uploading DAR to participant..."
daml ledger upload-dar \
  --host localhost \
  --port 5011 \
  target/lex-private-credit-0.0.1.dar

echo "✓ Lex deployed successfully"
