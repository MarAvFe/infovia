# RainCheck — Community Weather App Blueprint

> **Idioma principal: Español.** Toda la interfaz, mensajes de error, onboarding y comunicación con la comunidad es en español primero. Si el producto escala a otras regiones, el español se mantiene como idioma base.

## The Idea

Waze for rain. Motorcyclists (and eventually any weather-sensitive commuter) report current conditions at their location. Everyone who wants to read reports must first submit one. Crowdsourced, anonymous, no lying incentive.

Seed community: WhatsApp motorcycle group, ~100 members, 40-50 active. Distribution via shared link in chat.

---

## Core Mechanic

**Contribute to read.** You cannot view the map until you submit a report. One submission unlocks the map for your session. No accounts, no login.

**No incentive to lie.** Nobody gains from false weather data. Rain doesn't keep other riders away from a destination — it's not competitive. This is the key insight that makes crowdsourcing work here without moderation.

**Anonymity by design.** Exact GPS is fuzzed client-side (±~300m random offset) before it ever leaves the device. The server never sees a true location.

**Reports expire.** Any report older than 45 minutes is ignored at query time. Weather changes fast. Stale data is worse than no data.

---

## MVP Scope

### What it does
- User opens link → prompted to share location + select condition (Rain / Cloudy / Clear)
- On submit → fuzzed coordinates + condition written to DB
- Map unlocks → shows all active community reports as colored pins
- Background layer shows Open-Meteo API data when community reports are sparse (cold start fallback)

### What it explicitly does NOT do (MVP)
- No user accounts
- No push notifications
- No chat integration
- No severity levels (just Rain / Cloudy / Clear)
- No WhatsApp bot

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js or plain HTML/JS | Deployed on Vercel, HTTPS automatic |
| Hosting | Vercel | Already in use, subdomain trivial |
| Database | Supabase (Postgres) | Free tier, PostGIS for geo queries, no server to manage |
| Map | Leaflet.js + OpenStreetMap | No API key, mobile-friendly, lightweight |
| Weather fallback | Open-Meteo API | Completely free, no key required |
| Domain | weather.yourdomain.com | Subdomain of existing blog domain |

No Digital Ocean for this. Supabase handles the backend entirely at this scale.

---

## Data Model

One table. That's it.

```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  condition TEXT CHECK (condition IN ('rain', 'cloudy', 'clear')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Query filter for active reports (live view):
```sql
SELECT * FROM reports
WHERE created_at > now() - interval '45 minutes';
```

Query filter for historical slider:
```sql
SELECT * FROM reports
WHERE created_at BETWEEN $window_start AND $window_end;
```

Reports are **never deleted in real time**. A weekly cron purges anything older than 24 hours (the max history window). Storage cost at this scale is negligible.

---

## Historical Slider (Phase 1.5)

Not day-one MVP, but ship before opening to the wider group. This turns the app from a live tool into a pattern recognition tool — "it always rains in Zone X around 3PM" is useful for route planning, not just immediate decisions.

**UI:** A time slider beneath the map. Default position is "Ahora" (live, last 45 min). Drag left to go back in 3-hour increments up to 24 hours.

**Behavior:**
- In live mode: map auto-refreshes every 2 minutes
- In history mode: auto-refresh pauses, map shows reports for the selected window
- Clear visual indicator when you're in history mode (muted colors, timestamp label)
- If no community reports exist for that window, Open-Meteo fallback is hidden too — don't show API data for past windows, it's misleading

**The pattern insight:** When a user sees rain consistently in a zone at the same time across multiple days, that's microclimate data. No weather API captures that. This is the unique value of the crowdsourced layer.

---

## Fuzzing Logic (Client-Side)

Run this before the coordinates leave the browser. Never send raw GPS to the server.

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

---

## Gate Logic

localStorage flag. Technically clearable, but practically airtight for this audience: mobile Safari/Chrome bury the setting, the motorcycle community won't bother, and even if they did there's no incentive — submitting takes 10 seconds, circumventing takes 2 minutes. The WhatsApp group social contract does the rest.

```javascript
function hasReported() {
  return localStorage.getItem('raincheck_reported') === 'true';
}

function markReported() {
  localStorage.setItem('raincheck_reported', 'true');
}
```

Show submission form if `!hasReported()`. Show map if `hasReported()`.

---

## Build Order

Build in this sequence so you always have something working:

1. **Map + Open-Meteo fallback** — map renders with API weather data, no DB needed yet
2. **Geolocation + fuzz + submit form** — captures and writes a report to Supabase
3. **Gate logic** — localStorage check, form blocks map access
4. **Community reports layer** — read from Supabase, render as colored pins on top of fallback layer
5. **Polish** — mobile layout, loading states, error handling for denied geolocation
6. **Historical slider** — time filter UI, 3-hour increments, 24-hour window, pause auto-refresh in history mode

---

## Deferred to Opus (Architectural Decisions)

These questions are not complex enough to block the MVP but will need a considered answer before scaling:

- **Supabase RLS policy**: Should reports be publicly readable without auth? (Probably yes for MVP, revisit if abuse appears)
- **Rate limiting**: What prevents a single user from flooding the map with fake reports? (IP-based limit on Supabase edge functions, or just accept it for now)
- **Report clustering**: When 10 reports are within 500m of each other, how do you render them without overlapping pins? (Leaflet.MarkerCluster plugin, but decide the visual logic)
- **Cold start UX**: What does the user see if they submit but there are zero other reports? (Open-Meteo fallback should cover this, but the messaging matters)

---

## Distribution Strategy

### Phase 1 — Motorcycle community
- Share link directly in WhatsApp group with a one-line explanation
- Seed it yourself: submit a report before sharing so the map isn't empty
- Target: 5–10 consistent users from the active 40–50

### Phase 2 — Delivery riders
- Delivery riders have the same problem, stronger incentive (wet = slower = less income)
- Reach via community managers or rider Facebook groups
- No product changes needed — just different audience

### Phase 3 — General commuters
- Only pursue this if Phase 1 proves the mechanic works
- Would require severity levels, more condition options, possibly push notifications

---

## Why This Works (The Waze Analogy)

Waze took years to reach critical mass but proved the model: users generate the data that makes the product valuable for other users. The difference here is the feedback loop is immediate and local. You report rain on your corner, someone 3km away sees it in 30 seconds. The value is obvious and instant, which means the incentive to contribute is built into the use case — not manufactured.

The motorcycle community is the perfect seed. They are weather-sensitive, already coordinate informally over WhatsApp, and are used to sharing real-time pings manually. This app just makes that behavior structured and searchable.

---

## Open Questions (Decide Before Building)

1. Do reports need a severity level? (Heavy rain vs light drizzle) — probably Phase 2. Answer: they don't. And really the reports will not focus on current rain state, but will define a new exchange coin: "coat required". This way users get into the app and only select if they need a coat wherever they are located at that moment. In spanish is "capa".
2. Should the map auto-refresh every N minutes, or require manual refresh? — auto-refresh every 2 min recommended. Nah, manual refresh. maybe a popup that the current view is older than 10 min.
3. What happens when geolocation is denied by the user? — show an error, explain why it's required, don't let them in without it. Answer: show a prompt describing that "this app works if everyone chips in".