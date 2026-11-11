#!/usr/bin/env bash
# limpia.sh — borra las carpetas del examen y la línea de alias que dejó el H1
# Necesita bash: si lo lanzan con 'sh', se relanza solo con bash.
if [ -z "${BASH_VERSION:-}" ]; then
  if command -v bash >/dev/null 2>&1; then
    exec bash "$0" "$@"
  fi
  echo "Este script necesita bash: ejecútalo con   bash $0" >&2
  exit 1
fi
set -u

rm -rf "$HOME/examenA" "$HOME/examenB"

if [ -f "$HOME/.bashrc" ]; then
  # quita el comentario marcador y la línea de alias que va justo debajo
  sed -i '/# alias-examen/,+1d' "$HOME/.bashrc"
fi

echo "Estructura del examen eliminada. Puedes repetir con ./prepara.sh (o ./prepara.sh -b)."
