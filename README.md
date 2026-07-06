# Workflow OS

Ein lokal-first **persönliches Workflow-Betriebssystem** als echte, browserbasierte PWA.
Version **0.1.0** liefert ein hochwertiges Fundament mit voll funktionsfähigem Task-Modul,
Dashboard, Command Center und einer vorbereiteten **Action Registry** für die spätere
Claude-/MCP-Steuerung.

> Kein Wegwerf-Artifact, sondern ein echtes Projekt mit sauberer Schichtenarchitektur,
> lokaler Persistenz und klarer Erweiterbarkeit.

---

## Schnellstart

```bash
npm install
npm run dev
```

Dann die angezeigte URL öffnen (Standard: `http://localhost:5173`).

Weitere Skripte:

```bash
npm run build      # Typecheck + Produktions-Build (inkl. PWA Service Worker)
npm run preview    # Produktions-Build lokal testen (PWA aktiv)
npm run typecheck  # Nur TypeScript prüfen
```

**Voraussetzung:** Node ≥ 18 (getestet mit Node 24).

---

## Als Desktop-App (Tauri)

Workflow OS ist zusätzlich als native Windows-App (`.exe`) verpackt – kein Browser, kein Terminal.

```bash
npm run app         # Dev: natives Fenster mit Hot-Reload (statt npm run dev)
npm run app:build   # Erzeugt Standalone-.exe + Installer
```

**Voraussetzungen (einmalig):** Rust (rustup) und MSVC C++ Build Tools (via Visual Studio / Build Tools). WebView2 ist auf Windows 11 vorinstalliert.

Nach `npm run app:build` liegen die Artefakte unter `src-tauri/target/release/`:

- `workflow-os.exe` – Standalone, direkt doppelklickbar
- `bundle/nsis/Workflow OS_<version>_x64-setup.exe` – Installer (empfohlen: legt Startmenü-Eintrag an)
- `bundle/msi/Workflow OS_<version>_x64_en-US.msi` – MSI-Installer

Der native Wrapper (`src-tauri/`) ist bewusst dünn: er lädt exakt das gebaute PWA-Frontend aus `dist/`. Web und Desktop teilen sich also eine Codebasis.

---

## Was du heute damit machen kannst

- Tasks erstellen (Quick Add oder Formular), bearbeiten, löschen
- Status wechseln (offen · in Arbeit · pausiert · erledigt) – per Klick aufs Badge
- Priorität wechseln (P1–P5) – per Klick aufs Badge
- Suchen, nach Status/Priorität filtern, nach Priorität/Fälligkeit/Datum/Status sortieren
- Tagesfortschritt, offene Aufgaben & hohe Prioritäten auf dem Dashboard sehen
- Widgets ein-/ausblenden und umsortieren (Konfiguration wird lokal gespeichert)
- Alles bleibt nach Reload erhalten (localStorage)
- **Command Center**: die App über Befehle steuern

### Command Center – Beispiele

| Befehl | Wirkung |
| --- | --- |
| `create task: Jochen anrufen p4 morgen` | Aufgabe mit Priorität 4, fällig morgen |
| `open tasks` | Offene Aufgaben anzeigen |
| `priority 5` | Offene Aufgaben mit Priorität 5 |
| `today` | Heute fällige Aufgaben |
| `summarize` | Tages-Zusammenfassung |
| `open dashboard` | Zu einem Modul navigieren |
| `help` | Alle Befehle |

Jeder Befehl läuft über denselben Pfad, den später **Claude** nutzt:
`Parser → Action Registry (validiert) → Ausführung → UI-Feedback`.

---

## Architektur (Schichten)

```
UI  ──────────►  components/   (Layout, Dashboard, Widgets, Tasks, Command, UI-Primitives)
State ────────►  store/        (Zustand: Tasks[persist], Widgets[persist], UI)
Logic ────────►  lib/tasks, lib/command, lib/widgets, lib/navigation  (pure, testbar)
Persistence ──►  lib/storage/  (KeyValueStore-Abstraktion, austauschbar)
Actions ──────►  lib/command/actionRegistry  (typisiert + validiert)
Integration ──►  vorbereitet (Claude/MCP/REST) – siehe TODOs & types/index.ts
```

**Leitprinzipien**

- **Schichtentrennung:** UI kennt keine Persistenz, Logik kennt kein React.
- **Austauschbare Persistenz:** Alles geht durch `lib/storage/storage.ts`. localStorage
  heute, IndexedDB/Supabase/Backend später – ohne UI-Änderung.
- **Action Registry als Claude-Naht:** `runAction(id, input, ctx)` ist der einzige
  Ausführungspfad. Command Center heute, Claude/MCP morgen – identische Actions.
- **Motion zentral:** Alle Animationen in `lib/motion/motionPresets.ts`, `prefers-reduced-motion`
  wird respektiert.

### Projektstruktur (Auszug)

```
src/
  app/            App, Router
  components/
    layout/       AppShell, Sidebar, TopBar, MobileDrawer
    dashboard/    DashboardPage, WidgetGrid, widgets/*
    tasks/        TasksPage, TaskCard, TaskForm, QuickAddTask, Filters, Badges
    command/      CommandCenter, CommandInput, CommandResult
    ui/           Button, Card, Input, Select, Modal, Popover, Toggle, Icon …
    common/       Page, PlaceholderPage
  hooks/          useTasks, useCommand, useActionContext, useWidgetConfig …
  lib/
    tasks/        Typen, Utils, Filter, Metriken
    command/      Typen, actionRegistry, commandParser
    widgets/      Typen, Defaults
    navigation/   Modul-/Routen-Mapping
    storage/      Persistenz-Abstraktion
    motion/       Motion Presets
  store/          Zustand-Stores
  types/          zentrale Typen + vorbereitete Zukunfts-Entitäten
  styles/         globals.css (Design-Tokens)
```

---

## State Management

**Zustand** – bewusst gewählt statt reinem Context: mehrere unabhängige State-Domänen
(Tasks, Widgets, UI/Command), selektive Re-Renders, `persist`-Middleware über die
Storage-Abstraktion. Klein (~1 KB), kein Overhead.

---

## Bekannte Limitierungen (0.1.0)

- Nur das **Task-Modul** ist voll gebaut. Projects/Notes/Objects/Calendar/Automations/
  Integrations sind **Platzhalter** (Routen + Typen + Roadmap vorhanden).
- **Kein Drag-and-drop** – Widgets werden per Buttons sortiert (Architektur via `order`
  ist DnD-ready).
- **Kein Cloud-Sync** – rein lokal. Export/Import als JSON in den Settings.
- Command-Parser ist ein **regelbasierter MVP** (keine echte KI). Claude ersetzt/ergänzt
  diesen Schritt später.
- Kein Test-Setup in 0.1.0 (Logik ist bewusst pure & testbar gehalten).

## Roadmap → 0.2.0

- Widget-Konfiguration per Command (`configureWidget` aktivieren)
- Projects-Modul (Tasks ⇄ Projekte) beginnen
- Optionale Drag-and-drop-Widgets
- Erste echte **Claude-Anbindung** über die Action Registry (Intent → Action)
- Vitest-Setup für `lib/*`

---

## Design

Anthrazit-Basis, blaue Akzente, dunkle Cards, feine Borders, subtile Glows.
Design-Tokens leben als CSS-Variablen in `src/styles/globals.css` – einmal ändern,
überall wirksam.
