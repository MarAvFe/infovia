# RainCheck — CLAUDE.md

## Project Overview

Community weather reporting app for motorcyclists. Users submit a condition report to unlock the map — no accounts, no login. Crowdsourced, anonymous, local-first.

**Language: Spanish.** All UI text, error messages, onboarding, and labels are in Spanish. No exceptions at MVP.

---

## Core Mechanic (do not break this)

- **Contribute to read.** `localStorage` flag `raincheck_reported` gates map access. Show submission form if flag is absent; show map if flag is present.
- **No accounts.** Zero auth. Anonymous by design.
- **Fuzz GPS client-side** before any network call. Raw coordinates never reach the server. Use the `fuzzLocation()` function (see below).
- **Reports expire at 45 minutes** for the live view. Filter at query time — never delete in real time.
- **Report condition is "capa" (coat required) or not.** The condition field is currently `rain | cloudy | clear` in the DB, but the user-facing prompt asks "¿Necesitas capa?" and the options are framed around coat requirement, not weather label. Map these semantically: `rain` = needs coat, `clear` = no coat needed, `cloudy` = uncertain.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (deployed on Vercel) |
| Database | Supabase (Postgres + PostGIS) |
| Map | Leaflet.js + OpenStreetMap |
| Weather fallback | Open-Meteo API (no key required) |

No backend server. Supabase handles all persistence. All DB access is direct from the browser via Supabase JS client.

---

## Data Model

Single table, no foreign keys, no auth:

```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  condition TEXT CHECK (condition IN ('rain', 'cloudy', 'clear')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Active reports query (live view):
```sql
SELECT * FROM reports WHERE created_at > now() - interval '45 minutes';
```

Historical window query:
```sql
SELECT * FROM reports WHERE created_at BETWEEN $window_start AND $window_end;
```

A weekly cron purges rows older than 24 hours. No soft deletes.

---

## Critical Logic Snippets

### GPS Fuzzing (must run client-side before submit)
```javascript
function fuzzLocation(lat, lng, radiusMeters = 300) {
  const radiusDeg = radiusMeters / 111320;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusDeg;
  return {
    lat: lat + distance * Math.cos(angle),
    lng: lng + distance * Math.sin(angle)
  };
}
```

### Gate Logic

Gate uses a **timestamp**, not a boolean. Users must re-report after 10 minutes.
localStorage key: `raincheck_last_report` (stores `Date.now()` as string).

```javascript
const STALE_MS = 10 * 60 * 1000 // 10 minutes — exported from lib/gate.ts

function hasRecentReport() {
  const raw = parseInt(localStorage.getItem('raincheck_last_report') || '0', 10);
  const ts = Number.isFinite(raw) ? raw : 0;
  return Date.now() - ts < STALE_MS;
}
function markReported() {
  localStorage.setItem('raincheck_last_report', Date.now().toString());
}
```

---

## Build Order

Follow this sequence — each step produces something runnable:

1. Map renders with Open-Meteo fallback (no DB yet)
2. Geolocation + fuzz + submit form → writes to Supabase
3. Gate logic (localStorage blocks map until report submitted)
4. Community reports layer (reads Supabase, renders colored pins)
5. Mobile polish, loading states, geolocation-denied error handling
6. Historical slider (3-hour increments, 24-hour window, pauses auto-refresh)

---

## UX Rules

- **Geolocation denied:** Show a message in Spanish explaining the app only works if everyone participates. Example: *"Esta app funciona si todos aportamos. Necesitamos tu ubicación para registrar tu reporte."* Do not let the user proceed without location.
- **Map refresh:** Manual refresh only. If the current view is older than 10 minutes, show a subtle popup/toast prompting the user to refresh. No auto-refresh.
- **History mode:** Muted pin colors + timestamp label. Hide Open-Meteo fallback in history mode — showing API data for past windows is misleading.
- **Cold start (zero reports):** Open-Meteo fallback covers this. Message should make clear the data is from a weather API, not community reports.
- **Historical slider default:** "Ahora" (live mode, last 45 min).

---

## What MVP Does NOT Include

Do not add these unless explicitly asked:

- User accounts or authentication
- Push notifications
- Severity levels beyond the three conditions
- WhatsApp bot or chat integration
- Report clustering (Leaflet.MarkerCluster is a Phase 2 decision)
- Rate limiting (accept the risk for MVP)

---

## Map Pin Colors

| Condition | Color |
|---|---|
| `rain` (capa) | Blue |
| `cloudy` | Gray |
| `clear` (sin capa) | Yellow/Orange |

---

## Supabase Notes

- RLS: reports are publicly readable without auth for MVP.
- No edge functions at MVP. Direct table access from the browser.
- PostGIS is available but not required for MVP — plain lat/lng float queries are sufficient at this scale.

---

## Target Users (affects UX decisions)

Primary: motorcyclists in a WhatsApp group (~40–50 active members). Mobile-first. Spanish-speaking. Will share the app as a link in a chat. Expect Safari and Chrome on Android/iOS. No desktop optimization needed for MVP.
