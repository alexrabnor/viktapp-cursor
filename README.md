# Vikttapp (demo)

Mobil-först vikt- och injektionsspårning byggd med **Next.js** och en planerad **Directus**-backend.

## Kör appen (dev)

### Alternativ A: starta lokalt
1. Öppna en terminal i projektroten `Vikttapp`
2. Kör:
   - `cd apps/web`
   - `npm install`
   - `npm run dev -- --port 3561`

Appen öppnas på:
- `http://localhost:3561/dashboard`

### Alternativ B: starta med Docker Compose
`docker-compose.yml` mappar Next.js till port `3000` (och kör dev-servern).
- Starta: `docker compose up --build`
- Öppna: `http://localhost:3000/dashboard`

## Miljövariabel (Directus)

När vi kopplar in Directus “på riktigt” används:
- `NEXT_PUBLIC_DIRECTUS_URL` (t ex `http://localhost:8790`)

## Directus schema-utkast

Se:
- `docker/directus/schema-draft.md`

## Status i den här versionen

UI:n är interaktiv via en lokal demo-state (sparar i `localStorage`) så att du direkt kan testa flödena:
- viktloggning + viktgraf
- statistik (7/30 dagar), BMI-gauge och nästa injektion
- historik (kalender + listor)
- inställningar (inkl veckonoter, mått och progressfoton)
- export till CSV/PDF

Nästa steg är att ersätta local demo-state med faktiska CRUD-anrop mot Directus via SDK.

