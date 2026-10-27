# Arena multijugador Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current experimental duel modes with two usable multiplayer modes: Carrera multijugador and Práctica compartida, including public room discovery and timed learning help.

**Architecture:** Keep Firebase Realtime Database as the room transport, but separate pure room/game/timer decisions from DOM rendering and Firebase listeners. `duelo.js` remains the browser adapter and will consume small pure helpers from a new `duelo-core.js`. All players in a room receive the same fixed activity sequence; each player keeps an independent terminal state and progress.

**Tech Stack:** Vanilla JavaScript, Firebase 10.14.1 compat SDK, Firebase Realtime Database, Node.js test scripts, existing `linux-terminal.html` simulator and activity data.

**Spec:** `docs/superpowers/specs/2026-10-27-arena-multijugador-design.md`

## Global Constraints

- Only two modes exist: `carrera` and `practica`.
- No matchmaking, generated exercise variants, or player-authored anonymous questions.
- The activity sequence is fixed for every player in one room.
- The first hint appears after 8 seconds, each later hint after another 8 seconds, and the solution appears 8 seconds after the last hint.
- A solution never fills the terminal automatically.
- Career rooms record progress, errors, hints, and solution use; practice rooms do not penalize hints.
- Firebase server time controls the shared start; a browser clock cannot decide the winner.
- Existing single-player activities and their validation remain unchanged.

## Review Focus

- A room disappears or is full while a user is joining; the user must see a clear retry message and never be inserted twice.
- A player reloads or loses the connection during a race; their own progress must recover without changing another player's state.
- A player completes a step before 8 seconds; all pending hint/solution timers for that step must be cancelled.
- A step has fewer than three safe hints; the timer must still reach a useful solution state without repeating a message or exposing a full hint as a hint.
- A race finishes simultaneously for two players; the server transaction must assign one deterministic winner and preserve both final times.

### Task 1: Extract pure multiplayer state helpers

**Files:**
- Create: `html/iso/duelo-core.js`
- Create: `html/iso/pruebas/duelo-core.test.js`
- Modify: `html/iso/linux-terminal.html:2923` to load `duelo-core.js` before `duelo.js`

**Interfaces:**
- Produces `window.DUELO_CORE` with `MODOS`, `ESTADOS_SALA`, `crearConfiguracionSala`, `normalizarSala`, `esSalaUnible`, `calcularPosiciones`, and `crearPlanAyudas`.
- `crearPlanAyudas(paso, ahora)` returns `{ pistas, solucionEn, duracionPista }`, with `duracionPista === 8000` and no exact full example inside `pistas`.
- `calcularPosiciones(jugadores)` sorts finished players by final time and active players by progress, then by elapsed time.

- [ ] Write failing Node tests for the two mode names, valid room transitions, room capacity, deterministic positions, and the exact 8-second hint schedule.
- [ ] Run `node html/iso/pruebas/duelo-core.test.js` and confirm it fails because the core module does not exist.
- [ ] Implement the pure helpers without DOM, Firebase, timers, or global browser state.
- [ ] Run the focused test and confirm it passes.
- [ ] Run `node html/iso/pruebas/duelo-core.test.js` and commit `test: define multiplayer room and hint rules`.

### Task 2: Replace legacy room creation with a public room list

**Files:**
- Modify: `html/iso/duelo.js` sections 4–8 (state, Firebase, panel, room creation/joining)
- Modify: `html/iso/linux-terminal.html:2919-2923` only if script loading order needs correction
- Test: `html/iso/pruebas/duelo-core.test.js`

**Interfaces:**
- `crear(modo, bloque, capacidad)` writes `{modo:'carrera'|'practica', estado:'espera', visible:true, ids, capacidad, creador}`.
- `listarSalas(snapshot)` returns only public, joinable rooms with `{id, modo, creador, jugadores, capacidad, estado, ids}`.
- `unirse(id)` rejects missing, full, started, closed, and duplicate membership without a second write.

- [ ] Add failing pure tests for filtering stale/non-public/full/started rooms and for joining a room exactly once.
- [ ] Run the tests and confirm the new list behavior is absent.
- [ ] Replace the old “web/anonimo” controls with `carrera/practica`, activity block selection, capacity, and `Crear sala`.
- [ ] Subscribe to `salas` and render cards with mode, creator, activity range, players, capacity, and `Unirme`.
- [ ] Keep the code input as a secondary “Unirse con código” action.
- [ ] Remove the anonymous editor, question hashing, `MAX_PREGUNTAS`, and all `modo === 'anonimo'` branches.
- [ ] Run the core tests and perform a source check that no anonymous-mode UI or branch remains.
- [ ] Commit `feat: add public multiplayer room lobby`.

### Task 3: Implement shared room lifecycle and reconnection

**Files:**
- Modify: `html/iso/duelo.js` Firebase listeners, `salir`, `entrar`, `onSala`, and lifecycle rendering
- Modify: `html/iso/pruebas/duelo-core.test.js`

**Interfaces:**
- `normalizarSala` accepts `espera`, `cuenta-atras`, `jugando`, `terminada`, and `cerrada` only.
- `iniciarSala(ref, serverNow, minJugadores)` writes one shared `inicio` using Firebase server timestamp.
- `reconectarJugador(ref, uid)` restores the participant without resetting `prog`, `paso`, `fallos`, or `pistas`.

- [ ] Add failing tests for the lifecycle transitions and reload-safe participant records.
- [ ] Implement host start validation, minimum player count, and a shared server-time countdown.
- [ ] Add `onDisconnect().update/remove` cleanup for participants and stale room metadata.
- [ ] Make exiting a room explicit and safe; the host closing a room must not silently delete an active race.
- [ ] Render connection status, waiting state, countdown, and closed-room errors in accessible text.
- [ ] Run focused tests and commit `feat: make multiplayer rooms reconnectable`.

### Task 4: Build Carrera and Práctica from the same activity runner

**Files:**
- Create: `html/iso/duelo-runner.js`
- Modify: `html/iso/linux-terminal.html:2923` to load `duelo-runner.js` before `duelo.js`
- Modify: `html/iso/duelo.js` sequence and window sections
- Create: `html/iso/pruebas/duelo-runner.test.js`

**Interfaces:**
- `crearSecuencia(ids)` returns the fixed activity sequence shared by the room.
- `crearJugadorRunner(secuencia, modo, estadoInicial)` returns `{estado, enviar, progreso, terminar, cancelar}`.
- `enviar(comando)` delegates validation to the existing `validarPaso` and returns `{ok, salida, diagnostico, progreso}` without mutating another player.
- `resultadoJugador` returns `{prog, fallos, pistas, solucion, fin}`.

- [ ] Write failing tests for identical sequences, independent terminal states, successful commands, failed commands, and completion.
- [ ] Run the runner tests and confirm failure before implementation.
- [ ] Implement the shared runner using `crearEstado`, `validarPaso`, `rutaVisible`, and existing terminal helpers.
- [ ] Add Carrera rendering with live positions and winner transaction.
- [ ] Add Práctica rendering with live progress and no winner/penalty calculation.
- [ ] Remove the old separate 1vs1 assumptions while preserving the two-player Carrera behavior.
- [ ] Run runner tests and commit `feat: add race and practice runners`.

### Task 5: Add timed learning help

**Files:**
- Modify: `html/iso/duelo-core.js` plan helpers
- Modify: `html/iso/duelo.js` active-step rendering and input loop
- Modify: `html/iso/pruebas/duelo-core.test.js`

**Interfaces:**
- `crearRelojAyudas(plan, callbacks, reloj)` returns `{iniciar, cancelar}`.
- At `t=8000` it calls `onPista(0)`, at `t=16000` it calls `onPista(1)`, at `t=24000` it calls `onPista(2)`, and at `t=32000` it calls `onSolucion()`.
- Calling `cancelar()` prevents all future callbacks; calling `iniciar()` after cancellation starts a fresh step.

- [ ] Add fake-clock tests for all callbacks, cancellation after success, fewer-than-three hints, and reset on next step.
- [ ] Run the tests and verify they fail before adding the timer.
- [ ] Implement the timer with injectable `setTimeout`/`clearTimeout`, not hard-coded chained sleeps.
- [ ] Render one help message at a time and record hint/solution usage on the player record.
- [ ] Stop the timer on successful command, room exit, reload cleanup, and final result.
- [ ] Ensure practice does not penalize help and Carrera only records its use for results.
- [ ] Run the timer tests and commit `feat: add timed multiplayer hints`.

### Task 6: Results, review, and visual cleanup

**Files:**
- Modify: `html/iso/duelo.js` result and panel rendering
- Modify: `html/iso/linux-terminal.html` only for shared duel styles if necessary
- Create: `html/iso/pruebas/duelo-ui.test.js`

**Interfaces:**
- `renderResultado(sala, yo)` displays Carrera ranking or Práctica progress without exposing internal Firebase fields.
- `renderRevision(resultado)` lists failed steps, hints used, solution use, and relevant activity review links.

- [ ] Add source-level tests for visible mode names, accessible room cards, countdown text, winner text, and practice completion text.
- [ ] Implement responsive lobby cards and a compact in-game participant panel that never hides the terminal.
- [ ] Add `Revancha`, `Revisar errores`, and `Volver a practicar` actions.
- [ ] Add keyboard focus management and `aria-live` updates for room, countdown, hint, connection, and result changes.
- [ ] Run UI/source tests and manually test at 2 and 3 participants.
- [ ] Commit `feat: polish multiplayer results and accessibility`.

### Task 7: Verification and delivery

**Files:**
- Modify: `docs/superpowers/specs/2026-10-27-arena-multijugador-design.md` only if implementation reveals a clarified contract
- Test: all files under `html/iso/pruebas/`

- [ ] Run `node html/iso/pruebas/actividades.test.js` and confirm `92 actividades, 105 pasos, 0 errores`.
- [ ] Run `node html/iso/pruebas/duelo-core.test.js` and `node html/iso/pruebas/duelo-runner.test.js`.
- [ ] Extract and run `node --check` on each inline script and every new JavaScript file.
- [ ] Run `git diff --check` and inspect the final diff for leftover anonymous-mode names or stale `web` mode branches.
- [ ] Serve `html/iso` over HTTP and manually test room creation, joining, countdown, Carrera, Práctica, hints at 8-second intervals, solution at 32 seconds, reload, and simultaneous finish.
- [ ] Commit any final test-only fixes separately and report the exact test output before opening or updating a PR.
