import { directus } from "./client";
import { isDirectusError } from "@directus/sdk";

export async function directusLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    // mode: "json" keeps tokens in localStorage via authentication('json')
    await directus.login({ email, password }, { mode: "json" });
    return true;
  } catch (error) {
    if (isDirectusError(error)) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function directusLogout() {
  await directus.logout();
}

export async function directusRefresh() {
  await directus.refresh();
}

export async function directusGetToken() {
  return directus.getToken();
}

