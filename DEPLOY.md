# Deploy – Workflow OS (Web-App / PWA + Sync)

Ziel: **true-live** öffentliche URL (HTTPS), auf dem Handy installierbar, Updates per
`git push`, Daten synchron über alle Geräte.

Stack: **Netlify** (Frontend-Hosting) + **Supabase** (Auth + Postgres + Realtime).

---

## Schritt 1 – Live gehen (ohne Sync, ~5 Min)

Zwei Wege – wähle einen:

### A) Sofort live (ohne Git) – schnellster Test aufs Handy
1. `npm run build`
2. Auf <https://app.netlify.com/drop> gehen, den **`dist`-Ordner** reinziehen
3. Du bekommst sofort eine URL wie `https://random-name.netlify.app`
4. Am Handy öffnen → Browser-Menü → **Zum Startbildschirm hinzufügen**

### B) Richtig: Auto-Deploy bei jedem Push (empfohlen dauerhaft)
1. Repo auf GitHub anlegen (leeres Repo, z. B. `workflow-os`)
2. Lokal pushen:
   ```bash
   git remote add origin https://github.com/<dein-user>/workflow-os.git
   git push -u origin main
   ```
3. Auf <https://app.netlify.com> → **Add new site → Import from GitHub** → Repo wählen
4. Netlify liest `netlify.toml` automatisch (Build `npm run build`, Publish `dist`). **Deploy.**
5. Ab jetzt: jeder `git push` = automatisches Live-Update.

> PWA-Hinweis: Sobald es unter `https://…` läuft, ist die App auf dem Handy **installierbar**
> und funktioniert **offline** (Service Worker). Updates ziehen sich beim nächsten Öffnen automatisch.

---

## Schritt 2 – Sync einschalten (Supabase)

1. Projekt auf <https://supabase.com> anlegen (Free-Tier).
2. **SQL Editor** → Inhalt von [`supabase/schema.sql`](supabase/schema.sql) einfügen → **Run**.
3. **Project Settings → API** öffnen und diese zwei Werte kopieren:
   - `Project URL`
   - `anon` `public` key
4. Werte eintragen:
   - **lokal:** `.env` anlegen (Vorlage: `.env.example`) mit `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
   - **Netlify:** Site → **Environment variables** → dieselben zwei Keys anlegen → neu deployen
5. Mir die beiden Werte geben – dann baue ich Login (Magic-Link) + Realtime-Sync fertig und
   verifiziere gegen dein echtes Projekt.

> Der `service_role`-Key bleibt geheim und kommt **nie** ins Frontend. Sicherheit läuft über
> Row-Level Security (siehe `schema.sql`).

---

## Danach (Roadmap)

- Offline-Queue: Änderungen offline sammeln, bei Reconnect syncen
- Konflikt-Strategie über simples last-write-wins hinaus
- Später: native `.exe` (Tauri, bereits vorbereitet) als optionaler Download
