# Changelog

## 0.2.2

- Fix: on mobile, the map used `100vh`, which reserves space for the browser's collapsed nav bar — but since the map captures all scroll/touch gestures, the nav bar could never collapse, permanently hiding anything anchored near the bottom (including the Info button). Switched to `100svh` (small viewport height) so the layout always matches what's actually visible.
- Fix: Info button's lower edge now aligns with the legend's lower edge.

## 0.2.1

- Fix: Info button was invisible at the bottom-left — moved to bottom-right (former Share spot) with blue contrast like the Refrescar button.
- Add: "Compartir Baldazo" moved into the info panel, replacing the old standalone Share button.
- Fix: info panel now renders via a portal so scrolling it no longer pans/zooms the map underneath.
- Fix: contact form text (helper text and typed message) was gray and hard to read — now dark/black.
- Removed the location-fuzzing and 10-minute re-report FAQ entries from the info panel (anonymity note covers it).

## 0.2.0

- Fix: report timestamp now shows reliably on tap/click (was hover-only, unreliable on mobile).
- Add: info panel (ℹ️ Info button) with FAQ — anonymity, free/no-ads, location fuzzing, report expiry, re-report cadence.
- Add: "Instalar en mi teléfono" button in the info panel using the native PWA install prompt.
- Add: contact/feedback form in the info panel, stored in Supabase.
- Add: Vercel Analytics.

## 0.1.0

Initial MVP — everything before 0.2.0.

- Map with Open-Meteo fallback: shows a weather-API pin when there are no recent community reports nearby.
- Geolocation + GPS fuzzing: asks for the user's location and randomizes it before it ever reaches the server.
- Report submission: lets a user submit "¿necesita capa?" (needs coat / cloudy / clear) tied to their fuzzed location.
- Contribute-to-read gate: hides the map behind the report form until the user has submitted a recent report.
- Community reports layer: renders other users' reports as colored, emoji-labeled pins on the map.
- Share button: copies or native-shares the app link so users can invite others.
- Refresh / staleness indicator: shows "En vivo" plus a manual refresh button, and flags when data is stale.
- Legend: explains the pin colors and icons on the map.
- Rebrand to Baldazo: renamed the app and its assets from the original working name.
- Landing page: a standalone marketing page introducing the app before the map/report flow.
