#!/usr/bin/env bash
# Script de duplication : nouvelle agence (instance EstimaFlow)
# Usage : ./scripts/setup-new-agency.sh "Nom Agence" "admin@agence.fr"
# Prérequis : DATABASE_URL dans .env, migrations appliquées, tsx installé.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
AGENCY_NAME="${1:-Nouvelle Agence}"
ADMIN_EMAIL="${2:?Usage: $0 \"Nom Agence\" \"admin@email.fr\"}"

echo "Création de l'agence : $AGENCY_NAME (admin: $ADMIN_EMAIL)"
TEMP_PASS=$(openssl rand -base64 12)
echo "Mot de passe temporaire admin : $TEMP_PASS"

cd "$ROOT_DIR"
AGENCY_NAME="$AGENCY_NAME" ADMIN_EMAIL="$ADMIN_EMAIL" TEMP_PASS="$TEMP_PASS" npx tsx scripts/setup-new-agency.ts

echo "Terminé. Envoyez les identifiants à l'agence (email + mot de passe temporaire)."
