import { createDirectus, rest } from "@directus/sdk";

// Appen använder public-policy i Directus – ingen token behövs.
// Alla vikt_* kollektioner har read/create/update/delete för publik policy.
const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "https://databasen.alexcloud.se";

export const directus = createDirectus(DIRECTUS_URL).with(rest());
