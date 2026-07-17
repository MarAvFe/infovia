# Changelog

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

Everything before 0.2.0 — initial MVP: map with Open-Meteo fallback, geolocation + GPS fuzzing, report submission, contribute-to-read gate, community reports layer, share button, refresh/staleness indicator, legend, rebrand to Baldazo, landing page.
