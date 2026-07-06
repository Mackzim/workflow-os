# Workflow OS – MCP Server

Lässt **Claude dein Workflow-OS steuern** — ohne API-Kosten, über dein bestehendes
Claude-Abo (Claude Desktop oder Claude Code). Der Server schreibt in dieselbe
Supabase wie die App, dadurch **synct jede Änderung live auf dein Dashboard**
(Web + Handy).

```
Claude Desktop/Code  ──(MCP, stdio)──►  dieser Server  ──►  Supabase  ──►  Dashboard (live)
```

## Verfügbare Tools

| Tool | Zweck |
| --- | --- |
| `workflow_create_task` | Aufgabe anlegen (Titel, Priorität 1–5, Fälligkeit, Kategorie …) |
| `workflow_list_tasks` | Aufgaben auflisten/filtern/suchen |
| `workflow_update_task` | Felder einer Aufgabe ändern |
| `workflow_complete_task` | Aufgabe als erledigt markieren |
| `workflow_delete_task` | Aufgabe löschen |
| `workflow_summary` | Tages-Überblick + Fokusliste |

## Setup

### 1. Bauen

```bash
cd mcp-server
npm install
npm run build
```

### 2. Konfigurieren (`.env`)

```bash
cp .env.example .env
```

Dann `.env` ausfüllen:

- `SUPABASE_URL` – schon vorausgefüllt
- `WORKFLOW_USER_EMAIL` – deine Login-E-Mail (der Server ermittelt daraus deine User-ID)
- `SUPABASE_SERVICE_ROLE_KEY` – **Supabase → Project Settings → API → `service_role`**

> ⚠️ **Der `service_role`-Key ist geheim** (voller DB-Zugriff). Er läuft **nur lokal**
> in diesem Server, kommt **nie** ins Frontend und wird **nie** committet
> (`.env` ist in `.gitignore`). Behandle ihn wie dein Supabase-Passwort.

### 3. Selbsttest

```bash
npm run check
```

Erwartete Ausgabe: `OK – connected to Supabase. User: … | Tasks: N total …`

### 4. In Claude einbinden

**Claude Desktop** — `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "workflow-os": {
      "command": "node",
      "args": ["C:\\Users\\felix\\Desktop\\workflow-os\\mcp-server\\dist\\index.js"]
    }
  }
}
```

Claude Desktop neu starten. (Der Key liegt in `.env` daneben — muss **nicht** in die Config.)

**Claude Code** — einmalig:

```bash
claude mcp add workflow-os -- node C:\Users\felix\Desktop\workflow-os\mcp-server\dist\index.js
```

## Nutzung (Beispiele)

Sag Claude einfach:

- „Leg eine Aufgabe an: Jochen wegen Sortiment anrufen, Priorität 4, morgen fällig."
- „Was ist heute wichtig?" / „Zeig mir alle offenen Aufgaben mit Priorität 5."
- „Markier die Checkout-Bug-Aufgabe als erledigt."
- „Fass meinen Tag zusammen."

Claude ruft die passenden Tools auf → die Änderungen erscheinen **live** in deinem Dashboard.

## Hinweise

- Nach Code-Änderungen: `npm run build` neu ausführen (Claude nutzt `dist/`).
- Der Server ist bewusst auf **deine** Daten beschränkt (alle Operationen sind auf deine User-ID gescoped).
