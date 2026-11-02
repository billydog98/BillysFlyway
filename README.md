# Bills Ducks
Setup: `npm install && npm run dev` → http://localhost:3000. Deploy: push to GitHub, import in Vercel (no env vars needed).
Before deploying, set a real contact email in the User-Agent in `app/api/forecast/route.ts` (NWS requires it).
No API keys are required for the current sources (Open-Meteo, api.weather.gov).
Providers are isolated in `app/api/forecast/route.ts`; scoring is in `lib/score.ts`.
## Not built yet (nothing is faked)
Radar maps/loops (RainViewer or NWS radar tiles via Leaflet), 14-location northern AZ table, USGS water levels (waterservices.usgs.gov, no key),
eBird (free key, EBIRD_API_KEY, server-side only) / BirdCast observed migration, configurable push alerts.
