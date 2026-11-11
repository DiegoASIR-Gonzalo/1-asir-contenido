# Examen de práctica — Implantación de S.O. (1.º ASIR)

Simulacro de examen tipo «enunciados cortos + script corrector», de **25 minutos** y **nota /10**, para entrenar antes del examen real. Todo se crea y queda **dentro de tu carpeta de usuario** (`~/examenA` o `~/examenB`), sin tocar nada del sistema (solo se lee de `/etc` y `/dev`).

## Uso (en Debian)

```bash
chmod +x prepara.sh corrige.sh limpia.sh   # solo la primera vez

./prepara.sh        # variante A: crea ~/examenA y muestra la hora límite
./prepara.sh -b     # variante B: mismas preguntas, ficheros distintos (sin memoria)

# ... lee enunciado.pdf y trabaja los 8 apartados ...

./corrige.sh        # nota con decimales + ✔/✘ por ejercicio + pistas + aviso del history
./limpia.sh         # borra ~/examenA, ~/examenB y el alias del H1 en ~/.bashrc
```

## Qué contiene

| Fichero | Qué es |
|---|---|
| `prepara.sh` | Crea la estructura de ficheros y carpetas del examen y arranca el crono (25 min). `-b` para la variante B. |
| `enunciado.pdf` / `enunciado.html` | Los 8 apartados y 36 ejercicios con sus puntos (el HTML es imprimible). |
| `corrige.sh` | Corrector: nota sobre 10, ✔/✘ por ejercicio, pista genérica en los fallidos, **↳ diagnóstico** con lo que encontró frente a lo que esperaba (fichero guardado con otro nombre, copia en vez de enlace, permisos reales…) y history **interpretado** (usos, último comando y si un apartado falló a pesar de ejecutarse). |
| `limpia.sh` | Resetea todo para repetir el examen. |

## Apartados y puntuación

| Apartado | Puntos | |
|---|---|---|
| A · ls y comodines | 2,00 | 5 × 0,40 |
| B · cp, mv y rm | 1,50 | 5 × 0,30 |
| C · enlaces | 1,00 | 0,34 + 0,33 + 0,33 |
| D · permisos y umask | 1,00 | 5 × 0,20 |
| E · compresores | 1,50 | 5 × 0,30 |
| F · find | 1,00 | 4 × 0,25 |
| G · grep y tuberías | 1,00 | 5 × 0,20 |
| H · alias, variables y redirecciones | 1,00 | 4 × 0,25 |
| **Total** | **10,00** | |

## Truco del history

Bash no escribe el history en el fichero hasta cerrar la terminal. Para que se guarde al momento (y que tu profe —o este corrector— lo vea en vivo), añade a `~/.bashrc`:

```bash
PROMPT_COMMAND='history -a'
```

La nota la calcula `corrige.sh` con los **ficheros finales** (existencia, contenido, permisos, inodos, tars…); el history es solo orientativo, como aviso. Cada ejercicio fallido lleva además un diagnóstico `↳` que compara lo que entregaste con lo que se esperaba (por ejemplo: si guardaste la salida en otro fichero, si hiciste una copia en vez de un enlace, o qué permisos tiene ahora mismo el fichero).
