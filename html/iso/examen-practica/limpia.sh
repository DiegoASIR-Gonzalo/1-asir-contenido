#!/usr/bin/env bash
# limpia.sh — borra las carpetas del examen y la línea de alias que dejó el H1
set -u

rm -rf "$HOME/examenA" "$HOME/examenB"

if [ -f "$HOME/.bashrc" ]; then
  # quita el comentario marcador y la línea de alias que va justo debajo
  sed -i '/# alias-examen/,+1d' "$HOME/.bashrc"
fi

echo "Estructura del examen eliminada. Puedes repetir con ./prepara.sh (o ./prepara.sh -b)."
