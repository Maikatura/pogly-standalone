import type { UserManagerSettings } from "oidc-client-ts";
import { WebStorageStateStore } from "oidc-client-ts";

// OIDC config can come from two places, in priority order:
//   1. `window.POGLY_RUNTIME_CONFIG` — populated by /config.js at page load.
//      The docker entrypoint writes that file from `docker run -e OIDC_*`
//      env vars, so one prebuilt image can switch modes at run time.
//   2. `process.env.OIDC_*` — baked at `npm run build` time via vite.config.ts
//      from a `.env` file. Useful for non-docker deployments where you build
//      and serve the bundle yourself.
//
// If neither yields values, OIDC is disabled (Mode 1: anonymous tokens).
declare global {
  interface Window {
    POGLY_RUNTIME_CONFIG?: {
      OIDC_ISSUER?: string;
      OIDC_CLIENT_ID?: string;
    };
  }
}

const runtime = (typeof window !== "undefined" && window.POGLY_RUNTIME_CONFIG) || {};

const issuer = (runtime.OIDC_ISSUER ?? process.env.OIDC_ISSUER ?? "").trim();
const clientId = (runtime.OIDC_CLIENT_ID ?? process.env.OIDC_CLIENT_ID ?? "").trim();

export const oidcEnabled = issuer.length > 0 && clientId.length > 0;

const baseUrl = (() => {
  const raw = import.meta.env.BASE_URL ?? "/";
  const trimmed = (raw ?? "/").trim();
  if (trimmed === "/") return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
})();

const origin = window.location.origin.replace(/\.$/, "");;

export const oidcConfig: UserManagerSettings = {
  authority: issuer,
  client_id: clientId,

  redirect_uri: `${origin}${baseUrl}/callback`,
  post_logout_redirect_uri: `${origin}${baseUrl}/`,
  silent_redirect_uri: `${origin}${baseUrl}/silent-oidc-renew.html`,

  scope: "openid profile email",
  response_type: "code",

  automaticSilentRenew: true,

  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

export function onSigninCallback() {
  window.history.replaceState({}, document.title, window.location.pathname);
}