import { authentication, createDirectus, rest } from "@directus/sdk";

class DirectusAuthStorage {
  private key = "directus-auth";

  get() {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  set(data: unknown) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.key, JSON.stringify(data));
  }
}

const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8790";

// Central Directus SDK client.
// - `cache: "no-store"` minskar risken för stale data i Next.js.
// - `authentication('json')` gör att access/refresh-token kan sparas i localStorage.
export const directus = createDirectus(DIRECTUS_URL)
  .with(
    rest({
      onRequest: (options) => ({
        ...options,
        cache: "no-store",
      }),
    }),
  )
  .with(authentication("json", { storage: new DirectusAuthStorage() }));

