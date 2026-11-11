#!/usr/bin/env bash
# prepara.sh — crea la estructura sobre la que trabaja el examen de práctica
# Uso: ./prepara.sh      → variante A
#      ./prepara.sh -b   → variante B (mismas preguntas, ficheros distintos)
set -euo pipefail

VARIANTE="A"
[ "${1:-}" = "-b" ] && VARIANTE="B"
EXAM="$HOME/examen$VARIANTE"

if [ -e "$EXAM" ]; then
  echo "⚠  $EXAM ya existe. Ejecuta ./limpia.sh para resetear antes de empezar."
  exit 1
fi

umask 022
mkdir -p "$EXAM"/{documentos,logs,imagenes,musica,archivos,salidas}

# ---- documentos comunes a las dos variantes ----
for i in 1 2 3 4 5; do
  printf "documento %d\nlinea de relleno del documento\n" "$i" > "$EXAM/documentos/documento$i.txt"
done

# ---- ficheros de patrón: distintos en cada variante ----
if [ "$VARIANTE" = "A" ]; then
  printf "casa\n"  > "$EXAM/documentos/casa.txt"
  printf "mapa\n"  > "$EXAM/documentos/mapa.txt"
  printf "luna\n"  > "$EXAM/documentos/luna.txt"
  printf "mesa\n"  > "$EXAM/documentos/mesa.txt"
  printf "te\n"    > "$EXAM/documentos/te.txt"
  printf "tarta\n" > "$EXAM/documentos/tarta.txt"
  printf "tres\n"  > "$EXAM/documentos/tres.doc"
else
  printf "gato\n" > "$EXAM/documentos/gato.txt"
  printf "pato\n" > "$EXAM/documentos/pato.txt"
  printf "loma\n" > "$EXAM/documentos/loma.txt"
  printf "cama\n" > "$EXAM/documentos/cama.txt"
  printf "torre\n" > "$EXAM/documentos/torre.txt"
  printf "tia\n"   > "$EXAM/documentos/tia.txt"
  printf "tubo\n"  > "$EXAM/documentos/tubo.doc"
fi
printf "sopa\n" > "$EXAM/documentos/sopa.jpg"

# ---- registro para grep: contenido distinto por variante ----
if [ "$VARIANTE" = "A" ]; then
  cat > "$EXAM/logs/registro.log" <<'EOF'
lunes 07:00 arranque del sistema
ERROR: disco lleno
lilo cargado
204
aviso: actualizacion pendiente
linea de prueba
777
12
2035
Lima
luces apagadas

ultima linea
ERROR: red caida

fin del registro
EOF
else
  cat > "$EXAM/logs/registro.log" <<'EOF'
linea inicial del registro
ERROR: memoria insuficiente
luz encendida
305
911
lanza desplegada
aviso: reinicio programado

linea suelta
3058
Lima Peru

ERROR: timeout

fin del registro
EOF
fi

# ---- resto de la estructura ----
: > "$EXAM/logs/vacio.log"
cat > "$EXAM/logs/acceso.log" <<'EOF'
usuario entro a las 09:10
usuario salio a las 11:45
EOF

if [ "$VARIANTE" = "A" ]; then
  head -c 2048 /dev/zero > "$EXAM/imagenes/foto1.jpg"
  : > "$EXAM/imagenes/foto2.jpg"
  head -c 5120 /dev/zero > "$EXAM/imagenes/foto3.jpg"
else
  head -c 4096 /dev/zero > "$EXAM/imagenes/foto1.jpg"
  : > "$EXAM/imagenes/foto2.jpg"
  head -c 1024 /dev/zero > "$EXAM/imagenes/foto3.jpg"
fi

head -c 1024 /dev/zero > "$EXAM/musica/cancion1.mp3"
head -c 1024 /dev/zero > "$EXAM/musica/cancion2.mp3"

printf "hola mundo\n"  > "$EXAM/archivos/fich1"
printf "adios\n"       > "$EXAM/archivos/fich2"
printf "prueba\n"      > "$EXAM/archivos/fich3"
chmod 777 "$EXAM/archivos/fich3"     # D2 parte de rwxrwxrwx
printf "notas de clase\n" > "$EXAM/notas.txt"

echo "$VARIANTE" > "$EXAM/.examen"

# ---- arranque ----
AHORA=$(date +%H:%M)
LIMITE=$(date -d '+25 min' +%H:%M)
echo "=========================================="
echo "  EXAMEN DE PRÁCTICA — variante $VARIANTE"
echo "=========================================="
echo "  Carpeta de trabajo: $EXAM"
echo "  Empieza:  $AHORA"
echo "  Límite:   $LIMITE   (25 minutos)"
echo "------------------------------------------"
echo "  Lee enunciado.pdf y trabaja los 8 apartados."
echo "  Al terminar:  ./corrige.sh   y antes: history -w"
echo "=========================================="
