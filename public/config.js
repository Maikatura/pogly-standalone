// Runtime configuration for Pogly Standalone.
//
// This file ships empty by default. When running under Docker, the container
// entrypoint overwrites this file at startup with values pulled from
// `docker run -e OIDC_ISSUER=... -e OIDC_CLIENT_ID=...` so one prebuilt image
// can switch between Mode 1 (anonymous tokens) and Mode 2 (third-party OIDC)
// without rebuilding.
//
// For non-docker deployments, values baked into the bundle at `npm run build`
// time via `.env` are also honored - see vite.config.ts and src/Auth/oidc.ts.
window.POGLY_RUNTIME_CONFIG = window.POGLY_RUNTIME_CONFIG || {};
