#!/usr/bin/env bash
# Start a local Canton node for Lex development.
# Usage: ./scripts/start-canton.sh
set -euo pipefail

CANTON_VERSION="2.9.4"
CANTON_JAR="${HOME}/.daml/sdk/${CANTON_VERSION}/canton/canton.jar"

if [[ ! -f "${CANTON_JAR}" ]]; then
  echo "Canton JAR not found at ${CANTON_JAR}"
  echo "Install via: daml install ${CANTON_VERSION}"
  exit 1
fi

echo "Starting Canton node..."
java -jar "${CANTON_JAR}" daemon \
  --config canton/canton.conf \
  --bootstrap scripts/bootstrap.canton \
  "$@"
