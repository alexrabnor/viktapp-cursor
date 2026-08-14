// Auth behövs inte – appen använder public-policy i Directus.
// Dessa stubs finns kvar för att inte bryta eventuella importer.

export async function directusLogin(_payload: {
  email: string;
  password: string;
}) {
  return false;
}

export async function directusLogout() {
  // no-op
}

export async function directusRefresh() {
  // no-op
}

export async function directusGetToken(): Promise<string | null> {
  return null;
}
