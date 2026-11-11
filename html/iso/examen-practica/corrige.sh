#!/usr/bin/env bash
# corrige.sh — corrige el examen de práctica y da la nota /10
# Uso: ./corrige.sh   (detecta solo si trabajaste la variante A o la B)
# La nota sale de los ficheros finales. El history es solo aviso, sin puntos.
# En cada ✘ añade un ↳ diagnóstico con lo que encontró frente a lo que esperaba.
# Necesita bash: si lo lanzan con 'sh', se relanza solo con bash.
if [ -z "${BASH_VERSION:-}" ]; then
  if command -v bash >/dev/null 2>&1; then
    exec bash "$0" "$@"
  fi
  echo "Este script necesita bash: ejecútalo con   bash $0" >&2
  exit 1
fi

EXAM=""
[ -d "$HOME/examenA" ] && EXAM="$HOME/examenA"
[ -d "$HOME/examenB" ] && EXAM="$HOME/examenB"

if [ -z "$EXAM" ]; then
  echo "No encuentro ~/examenA ni ~/examenB. Ejecuta primero ./prepara.sh"
  exit 1
fi
if [ -d "$HOME/examenA" ] && [ -d "$HOME/examenB" ]; then
  echo "Existen examenA y examenB a la vez: no sé cuál corregir."
  echo "Ejecuta ./limpia.sh y repite una sola variante."
  exit 1
fi

VARIANTE="$(cat "$EXAM/.examen" 2>/dev/null || echo A)"
S="$EXAM/salidas"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PUNTOS=0
FALLOS=""
# formato decimal sin depender del locale (es_ES usa coma en printf)
fmt(){ LC_ALL=C awk "BEGIN{printf \"%.2f\", $1}"; }

c(){ PUNTOS=$(LC_ALL=C awk "BEGIN{print $PUNTOS + $1}"); printf "  \033[32m✔ %s\033[0m  (+%s)\n" "$2" "$(fmt "$1")"; }
# x título pista [se puede llamar luego a diag/dd/resdif para el diagnóstico]
x(){
  FALLOS="$FALLOS${1:0:1} "
  printf "  \033[31m✘ %s\033[0m  (+0.00)\n      \033[33m⚠ %s\033[0m\n" "$1" "$2"
}
tit(){ printf "\n\033[1m%s  (%s)\033[0m\n" "$1" "$2"; }
diag(){ printf "      \033[2m↳ %s\033[0m\n" "$1"; }
fallo_en(){ case " $FALLOS " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }

# compara un fichero del alumno con la salida recién generada en $TMP/esp
cmpf(){ [ -f "$S/$1" ] && diff -q "$TMP/esp" "$S/$1" >/dev/null 2>&1; }
# genera la salida esperada de un comando
esperar(){ bash -c "$1" > "$TMP/esp" 2>/dev/null || true; }
# normaliza rutas (quita ./ y el prefijo del examen, y la barra final) y ordena
norm(){ sed -e "s|^$EXAM/||" -e 's|^\./||' -e 's|/$||' "$1" 2>/dev/null | sort; }
# deja solo nombres de fichero y ordena
base(){ sed 's|.*/||' "$1" 2>/dev/null | sort; }
# permisos octales de un fichero (vacío si no existe)
perms(){ stat -c %a "$1" 2>/dev/null; }

# ════════════ diagnósticos ════════════
# ¿en qué sal*.txt del alumno está la salida esperada? (detecta nombres cambiados)
dondeesta(){
  local f
  for f in "$S"/sal*.txt; do
    [ -f "$f" ] || continue
    if diff -q "$TMP/esp" "$f" >/dev/null 2>&1 || diff -q <(base "$TMP/esp") <(base "$f") >/dev/null 2>&1; then
      basename "$f"; return 0
    fi
  done
  return 1
}
# diagnóstico de un sal*.txt que no existe: ¿está la salida en otro fichero?
dd(){
  if [ ! -f "$S/$1" ]; then
    local otro
    otro=$(dondeesta 2>/dev/null || true)
    if [ -n "$otro" ]; then
      diag "no existe $1, pero esa salida me aparece en $otro → te has equivocado de nombre en el >"
    else
      diag "no existe $1 → ese comando no llegó a redirigirse (o dio error y se quedó en la pantalla)"
    fi
  fi
}
# resumen de por qué difiere lo esperado (en $TMP/esp) de lo que entregó el alumno
resdif(){
  [ -f "$S/$1" ] || return 0
  local e a pe pa
  e=$(wc -l < "$TMP/esp" 2>/dev/null); a=$(wc -l < "$S/$1" 2>/dev/null)
  pe=$(head -n 1 "$TMP/esp" 2>/dev/null | cut -c1-60)
  pa=$(head -n 1 "$S/$1" 2>/dev/null | cut -c1-60)
  diag "esperaba $e línea(s) y tu fichero tiene $a · 1.ª esperada: «$pe» · 1.ª tuya: «$pa»"
}
# permisos reales de un fichero frente a los que se pedían
dperm(){
  local p c="${1#"$EXAM/"}"
  p=$(perms "$1")
  if [ -n "$p" ]; then diag "$c está ahora con $p (esperaba $2)"
  else diag "$c no existe"; fi
}

echo "╔══════════════════════════════════════════╗"
echo "║  CORRECCIÓN — examen de práctica $VARIANTE          ║"
echo "╚══════════════════════════════════════════╝"
echo "  Carpeta: $EXAM"

# ════════════ A · ls y comodines (2,00) ════════════
tit "Apartado A — ls y comodines" "2,00 · 0,40 cada uno"

esperar "ls -r /etc/t*"
if cmpf salA1.txt; then c 0.40 "A1 · /etc/t* en orden inverso"; else
  x "A1 · /etc/t* en orden inverso" "revisa -r y el glob t*: el orden inverso va en el ls, no en un sort"
  dd salA1.txt; resdif salA1.txt
fi

esperar "ls /dev/tty??"
if cmpf salA2.txt; then c 0.40 "A2 · tty con exactamente 5 caracteres"; else
  x "A2 · tty con exactamente 5 caracteres" "?? son exactamente 2 caracteres tras tty; tty0 no entra"
  dd salA2.txt; resdif salA2.txt
fi

esperar "ls -a $HOME"
if cmpf salA3.txt; then c 0.40 "A3 · HOME con ocultos incluidos"; else
  x "A3 · HOME con ocultos incluidos" "ocultos incluidos = -a; 'solo nombres' = sin -l"
  dd salA3.txt; resdif salA3.txt
fi

esperar "ls $EXAM/documentos/?a??.txt"
if [ -f "$S/salA4.txt" ] && diff -q <(base "$TMP/esp") <(base "$S/salA4.txt") >/dev/null 2>&1; then
  c 0.40 "A4 · segunda letra a, nombre de 4 letras"
else
  x "A4 · segunda letra a, nombre de 4 letras" "? = exactamente un carácter: ?a??.txt (casa, mapa, luna, mesa…) — el .txt va literal, sin comodín"
  dd salA4.txt
  [ -f "$S/salA4.txt" ] && diag "tu salA4.txt empieza por: «$(head -n 1 "$S/salA4.txt" | cut -c1-40)»"
fi

esperar "ls $EXAM/documentos/t*.txt"
if [ -f "$S/salA5.txt" ] && diff -q <(base "$TMP/esp") <(base "$S/salA5.txt") >/dev/null 2>&1; then
  c 0.40 "A5 · empiezan por t y acaban en .txt"
else
  x "A5 · empiezan por t y acaban en .txt" "t*.txt — el .doc no entra"
  dd salA5.txt; resdif salA5.txt
fi

# ════════════ B · cp, mv, rm (1,50) ════════════
tit "Apartado B — cp, mv y rm" "1,50 · 0,30 cada uno"

if [ -f "$S/documento1.txt" ] \
   && [ "$(stat -c %a "$S/documento1.txt")" = "$(stat -c %a "$EXAM/documentos/documento1.txt")" ] \
   && [ "$(stat -c %Y "$S/documento1.txt")" = "$(stat -c %Y "$EXAM/documentos/documento1.txt")" ]; then
  c 0.30 "B1 · copia conservando permisos y fechas"
else
  x "B1 · copia conservando permisos y fechas" "cp -p (o cp -a) conserva permisos y fechas; cp solo no"
  if [ -f "$S/documento1.txt" ]; then
    diag "la copia existe, pero orig=$(perms "$EXAM/documentos/documento1.txt") / copia=$(perms "$S/documento1.txt") y fechas $(stat -c %y "$S/documento1.txt" 2>/dev/null | cut -c1-16) vs $(stat -c %y "$EXAM/documentos/documento1.txt" 2>/dev/null | cut -c1-16) → faltó el -p"
  else
    diag "no existe salidas/documento1.txt"
  fi
fi

if [ -d "$S/imagenes" ] && [ -f "$S/imagenes/foto1.jpg" ] && [ -f "$S/imagenes/foto2.jpg" ] && [ -f "$S/imagenes/foto3.jpg" ]; then
  c 0.30 "B2 · copia imagenes/ incluido el propio"
else
  x "B2 · copia imagenes/ incluido el propio" "copiar un directorio con todo dentro e incluido él: cp -r imagenes salidas/"
  if [ -d "$S/imagenes" ]; then diag "imagenes/ está en salidas/ pero le faltan fotos → revisa la copia"
  elif [ -f "$S/foto1.jpg" ]; then diag "has copiado el CONTENIDO (salidas/foto1.jpg…) y no la carpeta entera → cp -r imagenes salidas/"
  else diag "no hay rastro de imagenes en salidas/"; fi
fi

if [ -f "$S/movido.log" ] && [ ! -e "$EXAM/logs/vacio.log" ]; then
  c 0.30 "B3 · mueve y renombra"
else
  x "B3 · mueve y renombra" "mv logs/vacio.log salidas/movido.log"
  [ -f "$S/movido.log" ] || diag "no existe salidas/movido.log"
  [ -e "$EXAM/logs/vacio.log" ] && diag "logs/vacio.log sigue en su sitio → mv lo mueve, cp lo copia"
  :
fi

if [ -f "$EXAM/logs/.acceso.log" ] && [ ! -e "$EXAM/logs/acceso.log" ]; then
  c 0.30 "B4 · oculta el archivo"
else
  x "B4 · oculta el archivo" "los ocultos empiezan por punto: mv acceso.log .acceso.log"
  if [ -f "$EXAM/logs/acceso.log" ] && [ -f "$EXAM/logs/.acceso.log" ]; then
    diag "ahora hay dos ficheros (acceso.log y .acceso.log) → has copiado en vez de mover"
  else
    diag "logs/.acceso.log no existe → el nombre nuevo lleva punto delante"
  fi
fi

if [ ! -e "$EXAM/musica" ]; then
  c 0.30 "B5 · borra con todo dentro"
else
  x "B5 · borra con todo dentro" "rm -r musica (rmdir no puede: no está vacío)"
  diag "musica/ sigue existiendo"
fi

# ════════════ C · Enlaces (1,00) ════════════
tit "Apartado C — enlaces" "1,00"

if [ -f "$S/fich1-duro" ] \
   && [ "$(stat -c %i "$EXAM/archivos/fich1")" = "$(stat -c %i "$S/fich1-duro")" ] \
   && [ "$(stat -c %h "$EXAM/archivos/fich1")" -ge 2 ]; then
  c 0.34 "C1 · enlace duro (mismo inodo)"
else
  x "C1 · enlace duro (mismo inodo)" "ln archivos/fich1 salidas/fich1-duro; compruébalo con ls -li"
  if [ -e "$S/fich1-duro" ]; then
    diag "fich1-duro existe pero su inodo ($(stat -c %i "$S/fich1-duro" 2>/dev/null)) no coincide con el de archivos/fich1 ($(stat -c %i "$EXAM/archivos/fich1" 2>/dev/null)) → es una copia (cp), no un enlace duro (ln)"
  else
    diag "no existe salidas/fich1-duro"
  fi
fi

if [ -L "$S/documentos-enlace" ] && [ "$(readlink -f "$S/documentos-enlace")" = "$EXAM/documentos" ]; then
  c 0.33 "C2 · enlace simbólico al directorio"
else
  x "C2 · enlace simbólico al directorio" "los enlaces relativos se resuelven desde donde VIVE el enlace: ln -s ../documentos salidas/documentos-enlace (o con ruta absoluta)"
  if [ -d "$S/documentos-enlace" ] && [ ! -L "$S/documentos-enlace" ]; then
    diag "documentos-enlace es una carpeta real: has copiado el directorio en vez de enlazarlo"
  elif [ -L "$S/documentos-enlace" ]; then
    RAW=$(readlink "$S/documentos-enlace" 2>/dev/null)
    RES=$(readlink -f "$S/documentos-enlace" 2>/dev/null)
    diag "tu enlace guarda «$RAW», que desde salidas/ resuelve a «${RES:-roto}»; debe resolver a $EXAM/documentos → usa ../documentos o la ruta absoluta"
  else
    diag "no existe salidas/documentos-enlace"
  fi
fi

if [ -f "$S/salC3.txt" ]; then
  INO=$(stat -c %i "$EXAM/archivos/fich1" 2>/dev/null)
  N=$(awk -v i="$INO" '$1==i' "$S/salC3.txt" | wc -l)
  if [ "$N" -ge 2 ] && grep -q "fich1" "$S/salC3.txt" && grep -q "fich1-duro" "$S/salC3.txt"; then
    c 0.33 "C3 · ls -li con el mismo inodo dos veces"
  else
    x "C3 · ls -li con el mismo inodo dos veces" "ls -li archivos/fich1 salidas/fich1-duro > salidas/salC3.txt"
    diag "tu salC3.txt tiene $N línea(s) con el inodo correcto (necesito 2). Pista: fich1 vive en archivos/, no en salidas/"
  fi
else
  x "C3 · ls -li con el mismo inodo dos veces" "ls -li archivos/fich1 salidas/fich1-duro > salidas/salC3.txt"
  diag "no existe salidas/salC3.txt"
fi

# ════════════ D · Permisos y umask (1,00) ════════════
tit "Apartado D — permisos y umask" "1,00 · 0,20 cada uno"

if [ "$(perms "$EXAM/archivos/fich2")" = "640" ]; then
  c 0.20 "D1 · octal: rw-r----- en fich2"
else
  x "D1 · octal: rw-r----- en fich2" "octal: rw-r----- = 640 (chmod 640)"
  dperm "$EXAM/archivos/fich2" "640"
fi

if [ "$(perms "$EXAM/archivos/fich3")" = "555" ]; then
  c 0.20 "D2 · simbólico: sin escritura para nadie"
else
  x "D2 · simbólico: sin escritura para nadie" "quitar la w a todos: chmod a-w (queda r-xr-xr-x = 555)"
  dperm "$EXAM/archivos/fich3" "555"
fi

if [ "$(perms "$EXAM/notas.txt")" = "744" ]; then
  c 0.20 "D3 · ejecución solo para el dueño"
else
  x "D3 · ejecución solo para el dueño" "u+x deja rwxr--r-- = 744"
  dperm "$EXAM/notas.txt" "744"
fi

if [ -d "$S/privado" ] && [ "$(perms "$S/privado")" = "700" ]; then
  c 0.20 "D4 · umask 077 → directorio 700"
else
  x "D4 · umask 077 → directorio 700" "umask 077 antes de mkdir; el directorio sale drwx------"
  if [ -d "$S/privado" ]; then
    diag "privado existe con $(perms "$S/privado") → ¿lo creaste ANTES de poner umask 077? El orden es: primero umask 077, después mkdir"
  else
    diag "no existe salidas/privado"
  fi
fi

if [ -f "$S/salD5.txt" ] && grep -qE '^0*22$' "$S/salD5.txt"; then
  c 0.20 "D5 · umask para rw-r--r--"
else
  x "D5 · umask para rw-r--r--" "partimos de 666 y quitamos w a grupo y otros → 022"
  [ -f "$S/salD5.txt" ] && diag "tu salD5.txt dice: «$(tr -d '[:space:]' < "$S/salD5.txt" | cut -c1-30)» — piensa: 666 menos la w de grupo y otros = 022"
  [ -f "$S/salD5.txt" ] || dd salD5.txt
  :
fi

# ════════════ E · Compresores (1,50) ════════════
tit "Apartado E — compresores" "1,50 · 0,30 cada uno"

if [ -f "$S/documentos.tar.gz" ] && tar -tzf "$S/documentos.tar.gz" > "$TMP/tarlista" 2>/dev/null \
   && grep -q "documento1.txt" "$TMP/tarlista"; then
  c 0.30 "E1 · agrupa y comprime documentos/"
else
  x "E1 · agrupa y comprime documentos/" "agrupar y comprimir a la vez: tar -czvf salidas/documentos.tar.gz documentos/"
  if [ -f "$S/documentos.tar.gz" ]; then
    diag "el .tar.gz existe pero tar no puede listarlo → se generó mal; repite el comando"
  else
    diag "no existe salidas/documentos.tar.gz"
  fi
fi

if [ -f "$S/salE2.txt" ] && [ -s "$S/salE2.txt" ]; then
  OK2=1
  while IFS= read -r miembro; do
    [ -n "$miembro" ] && grep -Fq "$miembro" "$S/salE2.txt" || OK2=0
  done < <(head -n 12 "$TMP/tarlista" 2>/dev/null)
  if [ "$OK2" = 1 ]; then
    c 0.30 "E2 · lista el tar sin extraer"
  else
    x "E2 · lista el tar sin extraer" "tar -tzvf salidas/documentos.tar.gz > salidas/salE2.txt"
    diag "el fichero no coincide con el listado real del tar → usa la t (listar) y redirige"
  fi
else
  x "E2 · lista el tar sin extraer" "tar -tzvf salidas/documentos.tar.gz > salidas/salE2.txt"
  [ -f "$S/salE2.txt" ] && diag "salE2.txt está vacío"
  [ -f "$S/salE2.txt" ] || dd salE2.txt
  :
fi

if [ -f "$S/restaurado/documento1.txt" ] || [ -f "$S/restaurado/documentos/documento1.txt" ]; then
  c 0.30 "E3 · extrae en otra carpeta"
else
  x "E3 · extrae en otra carpeta" "crea restaurado/ y extrae con -C: tar -xzf ... -C salidas/restaurado/"
  if [ -d "$S/restaurado" ]; then
    diag "restaurado/ existe pero no contiene documento1.txt → revisa la opción -C del tar"
  else
    diag "no has creado salidas/restaurado (mkdir)"
  fi
fi

if [ -f "$EXAM/imagenes/foto1.jpg.gz" ] && gzip -t "$EXAM/imagenes/foto1.jpg.gz" 2>/dev/null \
   && [ -f "$EXAM/imagenes/foto1.jpg" ]; then
  c 0.30 "E4 · gzip conservando el original"
else
  x "E4 · gzip conservando el original" "gzip -k conserva el original (y el .gz debe existir)"
  if [ -f "$EXAM/imagenes/foto1.jpg.gz" ] && [ ! -f "$EXAM/imagenes/foto1.jpg" ]; then
    diag "el .gz está pero el original desapareció → gzip sin -k borra el original"
  else
    diag "no existe imagenes/foto1.jpg.gz"
  fi
fi

if [ -f "$S/archivos.tar" ] && tar -tf "$S/archivos.tar" > /dev/null 2>&1 \
   && tar -tf "$S/archivos.tar" 2>/dev/null | grep -q "fich1"; then
  c 0.30 "E5 · empaqueta sin comprimir"
else
  x "E5 · empaqueta sin comprimir" "sin la z: tar -cvf salidas/archivos.tar archivos/"
  if [ -f "$S/archivos.tar" ]; then
    diag "el tar existe pero no contiene fich1 → ¿empaquetaste archivos/* (el contenido) en vez de archivos/ ?"
  else
    diag "no existe salidas/archivos.tar"
  fi
fi

# ════════════ F · find (1,00) ════════════
tit "Apartado F — find" "1,00 · 0,25 cada uno"

esperar "find $EXAM -name '*.jpg'"
if [ -f "$S/salF1.txt" ] && diff -q <(norm "$TMP/esp") <(norm "$S/salF1.txt") >/dev/null 2>&1; then
  c 0.25 "F1 · todos los .jpg del examen"
else
  x "F1 · todos los .jpg del examen" "find ~/examen -name '*.jpg' (con comillas) — de todo el examen"
  dd salF1.txt; resdif salF1.txt
fi

esperar "find $EXAM/archivos -mtime -1"
if [ -f "$S/salF2.txt" ] && diff -q <(norm "$TMP/esp") <(norm "$S/salF2.txt") >/dev/null 2>&1; then
  c 0.25 "F2 · modificados hace menos de 24 horas"
else
  x "F2 · modificados hace menos de 24 horas" "-mtime -1 = menos de 24 horas (con el -)"
  dd salF2.txt; resdif salF2.txt
fi

esperar "find $EXAM/documentos -mtime +1"
if [ -f "$S/salF3.txt" ] && diff -q <(norm "$TMP/esp") <(norm "$S/salF3.txt") >/dev/null 2>&1; then
  c 0.25 "F3 · modificados hace más de 2 días"
else
  x "F3 · modificados hace más de 2 días" "-mtime +1 = 48 horas o más (con el +)"
  dd salF3.txt; resdif salF3.txt
fi

esperar "find /etc -user root"
if [ -f "$S/salF4.txt" ] && diff -q <(norm "$TMP/esp") <(norm "$S/salF4.txt") >/dev/null 2>&1; then
  c 0.25 "F4 · de /etc, dueño root"
else
  x "F4 · de /etc, dueño root" "find /etc -user root"
  dd salF4.txt; resdif salF4.txt
fi

# ════════════ G · grep y tuberías (1,00) ════════════
tit "Apartado G — grep y tuberías" "1,00 · 0,20 cada uno"
REG="$EXAM/logs/registro.log"

esperar "grep -i '^l' $REG"
if cmpf salG1.txt; then c 0.20 "G1 · líneas que empiezan por l (i/ms)"
else
  x "G1 · líneas que empiezan por l (i/ms)" "grep -i '^l' logs/registro.log"
  dd salG1.txt; resdif salG1.txt
fi

esperar "grep -E '^[0-9]{3}$' $REG"
if cmpf salG2.txt; then c 0.20 "G2 · líneas que son exactamente 3 dígitos"
else
  x "G2 · líneas que son exactamente 3 dígitos" "grep -E '^[0-9]{3}$' — las anclas obligan a que la línea entera sean 3 dígitos"
  dd salG2.txt; resdif salG2.txt
fi

esperar "grep -c '^$' $REG"
if cmpf salG3.txt; then c 0.20 "G3 · cuenta las líneas vacías"
else
  x "G3 · cuenta las líneas vacías" "grep -c '^$' (cuenta; ^$ = línea sin nada)"
  dd salG3.txt; resdif salG3.txt
fi

esperar "who | sort"
if cmpf salG4.txt; then c 0.20 "G4 · conectados ordenados alfabéticamente"
else
  x "G4 · conectados ordenados alfabéticamente" "who | sort (sort ordena por usuario, que abre cada línea)"
  dd salG4.txt; resdif salG4.txt
fi

esperar "head -n 5 $REG"
if cmpf salG5.txt; then c 0.20 "G5 · las 5 primeras líneas"
else
  x "G5 · las 5 primeras líneas" "head -n 5 logs/registro.log"
  dd salG5.txt; resdif salG5.txt
fi

# ════════════ H · Alias, variables y redirecciones (1,00) ════════════
tit "Apartado H — alias, variables y redirecciones" "1,00 · 0,25 cada uno"

if [ -f "$HOME/.bashrc" ] && grep -q "alias ll=" "$HOME/.bashrc" && grep -q "alias-examen" "$HOME/.bashrc"; then
  c 0.25 "H1 · alias ll en .bashrc (marcado)"
else
  x "H1 · alias ll en .bashrc (marcado)" "alias ll='ls -alF' pegado al =, y en ~/.bashrc debajo de # alias-examen"
  if grep -q "alias ll=" "$HOME/.bashrc" 2>/dev/null; then
    diag "el alias está en .bashrc pero falta la línea # alias-examen justo encima"
  else
    diag "no veo 'alias ll=' en ~/.bashrc → añádelo debajo de # alias-examen"
  fi
fi

if [ -f "$S/salH2.txt" ] && [ "$(tr -d '[:space:]' < "$S/salH2.txt")" = "$(date +%Y)" ]; then
  c 0.25 "H2 · variable con el año"
else
  x "H2 · variable con el año" "ANIO=\$(date +%Y) y luego echo \"\$ANIO\" > salidas/salH2.txt"
  if [ -f "$S/salH2.txt" ]; then
    diag "tu salH2.txt dice «$(tr -d '[:space:]' < "$S/salH2.txt" | cut -c1-30)» y esperaba $(date +%Y) → usa \$ANIO con $ y comillas: echo \"\$ANIO\""
  else
    dd salH2.txt
  fi
fi

if [ -f "$S/salH3.txt" ] && [ -s "$S/salH3.txt" ] && grep -q '^ls:' "$S/salH3.txt"; then
  c 0.25 "H3 · solo el error, redirigido"
else
  x "H3 · solo el error, redirigido" "el error va por el canal 2: ls /noexiste 2> salidas/salH3.txt"
  if [ -f "$S/salH3.txt" ] && [ ! -s "$S/salH3.txt" ]; then
    diag "salH3.txt está vacío → con > normal rediriges stdout (que no salía nada); el error es el canal 2: 2>"
  elif [ -f "$S/salH3.txt" ]; then
    diag "el fichero no empieza por 'ls:' → no contiene el mensaje de error"
  else
    dd salH3.txt
  fi
fi

if [ -f "$S/salH4.txt" ] && grep -q "ll=" "$S/salH4.txt"; then
  c 0.25 "H4 · listado de alias activos"
else
  x "H4 · listado de alias activos" "alias > salidas/salH4.txt (debe salir el ll del H1)"
  if [ -f "$S/salH4.txt" ]; then
    diag "el fichero existe pero no aparece 'll=' → el alias debe estar activo en la shell donde ejecutas alias (source ~/.bashrc)"
  else
    dd salH4.txt
  fi
fi

# ════════════ nota final ════════════
NOTA=$(fmt "$PUNTOS")
printf "\n\033[1m──────────────────────────────\033[0m\n"
printf "\033[1m  NOTA FINAL: %s / 10\033[0m\n" "$NOTA"
printf "──────────────────────────────\n"
if LC_ALL=C awk "BEGIN{exit !($PUNTOS >= 9)}"; then
  echo "  💪 Estás listo para mañana."
elif LC_ALL=C awk "BEGIN{exit !($PUNTOS >= 7)}"; then
  echo "  📌 Repasa los ⚠ y los ↳ de los apartados fallidos y vuelve a intentarlo con -b."
else
  echo "  📚 Repasa la chuleta (html/iso/chuleta.html) y repite el examen con ./limpia.sh + ./prepara.sh -b."
fi

# ════════════ history: interpretado, sin puntos ════════════
echo
echo "🧐 History (sin puntos, solo orientativo)"
HIST="${HISTFILE:-$HOME/.bash_history}"
if [ ! -s "$HIST" ]; then
  echo "   No veo tu history. Ejecuta 'history -w' en tu terminal y vuelve a corregir."
else
  aptos=(A B C D E F G H)
  pats=('\bls\b' '\b(cp|mv|rm)\b' '\bln\b' '\b(chmod|umask)\b' '\b(tar|gzip|gunzip)\b' '\bfind\b' '\b(grep|head|who)\b' '\balias\b')
  cmds=("ls" "cp/mv/rm" "ln" "chmod/umask" "tar/gzip" "find" "grep/head/who" "alias")
  TOTAL=$(grep -cvE '^[[:space:]]*(#|$)' "$HIST" 2>/dev/null)
  echo "   Tu history guardado tiene $TOTAL comandos."
  for i in 0 1 2 3 4 5 6 7; do
    L=${aptos[$i]}
    N=$(grep -Eci "${pats[$i]}" "$HIST" 2>/dev/null)
    ULT=$(grep -Ei "${pats[$i]}" "$HIST" 2>/dev/null)
    [ "$i" -ne 7 ] && ULT=$(printf '%s\n' "$ULT" | grep -viE '^[[:space:]]*alias\b')
    UEX=$(printf '%s\n' "$ULT" | grep -iE 'examen|salidas|registro\.log' | tail -n 1)
    [ -n "$UEX" ] && ULT="$UEX"
    ULT=$(printf '%s\n' "$ULT" | tail -n 1 | cut -c1-55)
    if [ "$N" -eq 0 ]; then
      if fallo_en "$L"; then
        echo "   $L (${cmds[$i]}): no aparece en el history guardado. Si lo hiciste, ejecuta 'history -w' y vuelve a corregir: puede que la terminal aún no lo haya escrito."
      fi
    elif fallo_en "$L"; then
      echo "   $L (${cmds[$i]}): $N uso(s). Último: «$ULT» → los comandos están, pero el resultado no cuadra: repasa los ⚠ de arriba."
    else
      echo "   $L (${cmds[$i]}): $N uso(s) ✓"
    fi
  done
  echo "   Tus comandos más repetidos: $(grep -vE '^[[:space:]]*(#|$)' "$HIST" | awk '{print $1}' | sort | uniq -c | sort -rn | head -n 4 | awk '{printf "%s×%s ", $2, $1}')"
  echo "   (la nota sale de los ficheros; el history solo orienta: si acabas de hacer el examen, los comandos pueden no estar guardados aún)"
fi
echo
echo "  💡 Para que el history se guarde al momento, añade a ~/.bashrc:"
echo "     PROMPT_COMMAND='history -a'"
