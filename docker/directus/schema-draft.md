# Vikttapp: Directus-schema (utkast)

Det här dokumentet beskriver den föreslagna Directus-datakartan för `Vikttapp`:
- Collections och fält (inkl datatyper)
- Item-level permissions per collection (filter med `$CURRENT_USER.id`)

Det är ett “schema draft” för att vi ska kunna implementera klienten, export, och beräkningar konsekvent.

> Viktigt: Exakta namn/datatyper i Directus kan behöva justeras lite beroende på Directus-version och din befintliga setup. Men logiken och fältens syfte är stabil.

## Gemensamma rekommendationer

Alla personliga “logg-/inställnings”-collections ska ha:
- `user` (M2O till `directus_users`)

Item-level permissions ska i regel vara:
- `READ/CREATE/UPDATE/DELETE` begränsas till `user.id == $CURRENT_USER.id`

Exempel på filterregel (Directus item-level):

```json
{
  "user": {
    "_eq": "$CURRENT_USER.id"
  }
}
```

## Collections

### `user_settings`
Användarens grundinställningar (höjd, mål, injektionsintervall).

- `user` (M2O -> `directus_users`, required, unique per user)
- `height_cm` (Decimal, required)
- `goal_weight_kg` (Decimal, required)
- `injection_interval_days` (Int, required)
- `dose_amount_mg` (Decimal, required)
- `prediction_window_days` (Int, optional)
- `created_at` / `updated_at` (systemfält)

### `weight_entries`
Viktloggar per datum.

- `user` (M2O -> `directus_users`, required)
- `measured_at` (Datetime, required, indexed)
- `weight_kg` (Decimal, required)
- `source` (String, optional; t ex `manuell`)
- `created_at` / `updated_at` (systemfält)

Index/förfrågningar vi kommer använda:
- `measured_at` per user

### `injection_plans`
Injektionsplan (intervall, start).

- `user` (M2O -> `directus_users`, required)
- `interval_days` (Int, required)
- `start_date` (Date/Datetime, required)
- `next_manual_at` (Datetime nullable, optional)
- `dose_amount_mg` (Decimal, required)
- `active` (Boolean, required, default `true`)
- `created_at` / `updated_at` (systemfält)

MVP kan ha max 1 aktiv plan per user.

### `injection_logs`
Historik per injektion (och ev side effects).

- `user` (M2O -> `directus_users`, required)
- `injected_at` (Datetime, required, indexed)
- `dose_amount_mg` (Decimal, required)
- `dose_unit` (String, optional; default `"mg"`)
- `notes` (String nullable)
- `nausea` (Int nullable, 0..3)
- `fatigue` (Int nullable, 0..3)
- `appetite` (Int nullable, 0..3)
- `created_at` / `updated_at` (systemfält)

### `goals`
Huvudmål och (valfritt) target_date.

- `user` (M2O -> `directus_users`, required)
- `start_weight_kg` (Decimal, required)
- `goal_weight_kg` (Decimal, required)
- `target_date` (Date/Datetime nullable)
- `active` (Boolean, required, default `true`)
- `created_at` / `updated_at` (systemfält)

### `goal_milestones`
Milestones kopplade till `goals`.

- `goal` (M2O -> `goals`, required)
- `title` (String, required)
- `target_weight_kg` (Decimal, optional om vi senare stödjer percent)
- `achieved_at` (Datetime nullable)
- `sort_order` (Int, optional)
- `created_at` / `updated_at` (systemfält)

### `body_measurements`
Måtthistorik.

- `user` (M2O -> `directus_users`, required)
- `measured_at` (Datetime, required, indexed)
- `waist_cm` (Decimal nullable)
- `chest_cm` (Decimal nullable)
- `hips_cm` (Decimal nullable)

### `weekly_notes`
Anteckningar per vecka.

- `user` (M2O -> `directus_users`, required)
- `week_start_date` (Date, required, indexed)
- `note` (Text, required) eller `String`
- `mood` (Int/String optional)

### `progress_photos`
Fotohistorik.

- `user` (M2O -> `directus_users`, required)
- `taken_at` (Datetime, required)
- `label` (String optional; t ex `front`)
- `image` (File, required) (Directus fil-fält)

## Item-level permissions (mall)

För collections som har `user`-fält:

1. Filterregel för `READ`:
   ```json
   { "user": { "_eq": "$CURRENT_USER.id" } }
   ```
2. Filterregel för `CREATE`/`UPDATE`/`DELETE`:
   - Samma princip: använd item-level filter.

> Observations: Directus support kan variera mellan versioner. Om din instans kräver extra “system actions” (t ex sättning av `user` vid CREATE) kan vi komplettera med Directus Relations + Defaults eller flöde/automation.

## Nästa steg (när du har Directus-körning)

När du vill att jag ska “göra det på riktigt” mot din Directus-instans behöver vi:
- Din exakta Directus URL (t ex `https://host:8790`)
- Om vi ska skapa schema via Directus UI manuellt, eller via export/import.
- Hur du vill hantera auth (login via Directus, eller appens egen registrering).

