# Self-hosting Pogly Standalone

This guide covers running Pogly Standalone on your own infrastructure via Docker. For the free hosted version, see [pogly.gg](https://pogly.gg) instead.

## What's in the box

The shipped Docker image bundles three things into a single container:

- **SpacetimeDB** (pinned to v1.7.0) — the realtime database that stores canvas elements, layouts, guests, permissions, and config.
- **Caddy** — serves the React SPA from `/` and reverse-proxies `/v1/*` (SpacetimeDB's HTTP + WebSocket surface) to the in-container database.
- **The Pogly Standalone web app** — the built React bundle.

Caddy listens on port 80 inside the container. Publish one host port and you have a single URL that serves both the UI and the realtime connection.

## Quick start

```bash
docker volume create pogly-stdb

docker run -d \
  --name pogly \
  -p 8080:80 \
  -v pogly-stdb:/stdb \
  ghcr.io/poglyapp/pogly:latest
```

Open <http://localhost:8080>:

1. Pick **docker** in the domain dropdown.
2. Enter `pogly` as the module name.
3. Click **connect**.

First connect runs the onboarding flow (platform, channel, password, etc.). Subsequent connects go straight to the canvas.

Useful commands:

```bash
docker logs -f pogly   # follow container output
docker stop pogly      # graceful shutdown
docker start pogly     # resume
```

## Identity modes

Pogly supports two ways for the browser to authenticate to SpacetimeDB. Pick one based on what recovery story you want.

### Mode 1 — anonymous tokens (default)

SpacetimeDB issues a fresh anonymous identity on first connect and the browser persists it in `localStorage` under `stdb-token`. The first identity to finish onboarding becomes the canvas owner.

- **Pros:** zero external dependencies; no account system; works offline of any auth provider.
- **Cons:** if the streamer clears localStorage (browser reset, "clear site data", different device, etc.) the token is gone *forever* — there is no recovery path. The published-module state in `/stdb` still records that token as the owner, so even spinning up a new browser session won't recover ownership.

Best for: single-user / single-machine self-hosts where the streamer controls their own browser storage.

### Mode 2 — third-party OIDC

Pogly signs the user in against any OpenID Connect provider (Auth0, Authentik, Keycloak, Google, Okta, etc.) and passes the resulting `id_token` to SpacetimeDB. SpacetimeDB validates the token against the issuer's JWKS endpoint and derives a stable Identity from its `sub` claim. Signing in to the same OIDC account always produces the same Pogly identity.

- **Pros:** ownership is recoverable. Lost browser? Sign in again at the provider — same identity, same canvas.
- **Cons:** requires a working OIDC provider and an app registration there.

#### Setting up Mode 2

1. **At your OIDC provider**, register a new application. You need:
   - **Allowed redirect URIs:** `<your-pogly-origin>/callback` (e.g. `http://localhost:8080/callback`, or `https://pogly.example.com/callback` behind TLS). No trailing slash.
   - **Silent renew redirect:** `<your-pogly-origin>/silent-oidc-renew.html` (optional but recommended — without it, the user gets re-prompted when the access token expires).
   - **Required scopes:** `openid profile email`.
   - **Response type:** `code` (PKCE).
2. **At runtime**, pass two env vars to `docker run`:

```bash
docker run -d \
  --name pogly \
  -p 8080:80 \
  -v pogly-stdb:/stdb \
  -e OIDC_ISSUER=https://your-oidc-provider.example/ \
  -e OIDC_CLIENT_ID=your-client-id \
  ghcr.io/poglyapp/pogly:latest
```

3. **Confirm** the container logs print `Runtime config: OIDC enabled (issuer=…, client_id=…)`. The login page should now block with a "This Pogly instance requires OIDC sign-in" overlay and a sign-in button.

The OIDC values are written to `/usr/share/caddy/config.js` at container start; the SPA loads that file *before* the React bundle and reads `window.POGLY_RUNTIME_CONFIG`. To change OIDC config, recreate the container — `docker start` of an existing one won't re-run the entrypoint and the old values stay baked into the served file.

#### Why this works without configuring SpacetimeDB

SpacetimeDB automatically fetches your OIDC issuer's `.well-known/openid-configuration` and JWKS endpoints to validate the token signature, expiry, and audience. No issuer trust list to maintain — anything reachable over the network with a valid OIDC discovery doc will work.

## Persistent volumes

Pogly state lives in `/stdb` inside the container. **Mount a named volume there for any deployment you intend to keep.** The quick-start command above already does this; treating it as required keeps you out of trouble.

What's in `/stdb`:

- The published `.wasm` module.
- All SpacetimeDB tables (elements, layouts, guests, permissions, audit log, config — including `Config.OwnerIdentity`).
- A sentinel file `.pogly-published-pogly` written after the first successful publish.

To reset everything — canvas state, ownership, published module:

```bash
docker stop pogly
docker rm pogly
docker volume rm pogly-stdb
docker volume create pogly-stdb
# ...then docker run again
```

## Updating to a new image

New Pogly releases ship as new image tags. To upgrade while keeping canvas state:

```bash
docker pull ghcr.io/poglyapp/pogly:vX.Y.Z
docker stop pogly
docker rm pogly
docker run -d --name pogly -p 8080:80 -v pogly-stdb:/stdb \
  ghcr.io/poglyapp/pogly:vX.Y.Z
```

The new container reuses the existing `/stdb` volume, sees the sentinel file, and skips republishing. The **client-side** changes in the new image (React bundle, Caddyfile, entrypoint) take effect immediately. The **server-side** module wasm baked into the new image is *not* picked up automatically — see below.

### Forcing a wasm republish

If a release notes that the SpacetimeDB module changed (new tables, new reducers, schema changes), republish the wasm against your existing data:

```bash
docker exec pogly rm /stdb/.pogly-published-pogly
docker restart pogly
```

> **Known limitation:** the entrypoint publishes with `--anonymous`, which generates a fresh CLI identity every container start. SpacetimeDB rejects a republish onto an existing module from a different identity than the one that did the original publish. Until that's fixed (the entrypoint will need to persist the CLI identity to a docker volume so it survives restarts), routine wasm updates may require nuking `/stdb` — which loses canvas state. **For now, treat wasm updates as a rare event.**

## Building your own image

If you prefer to bake configuration into the image instead of supplying it at run time — say, for a fully-baked image you ship to non-technical operators — clone the repo, fill `.env`, and build:

```bash
git clone https://github.com/PoglyApp/pogly-standalone.git
cd pogly-standalone
git checkout self-host-rework   # until merged to main
cp .env.example .env
# edit .env — fill OIDC_ISSUER and OIDC_CLIENT_ID if you want Mode 2 baked
docker build -t my-pogly .
```

Precedence is: a value supplied at `docker run -e ...` time **wins over** anything baked at `docker build` time, which **wins over** the empty default. So a baked-in Mode 2 image can still be overridden per-deployment without rebuilding.

## Claim-driven authorization (advanced)

Mode 2 self-hosters who want to gate specific reducers behind OIDC claim checks (e.g. "only `sub=user_abc123` can update the editor guidelines") can extend the SpacetimeDB module with claim-aware checks. The file [`server/Utility/AuthUtility.cs`](../server/Utility/AuthUtility.cs) ships with starter helpers:

- `GetJwtClaims(ctx)` — extract the JWT payload from the connection token.
- `GetJwtPayloadProperty(claims, "sub")` — pull a specific claim value.
- `VerifyClient(ctx)` / `VerifyDeveloper(ctx)` — issuer/audience checks and a `sub` allowlist. **The stock placeholders intentionally throw** — edit the file to fit your provider before invoking them.

None of these helpers are called by the stock module. To use them, edit the relevant reducer in `server/` to call `VerifyClient(ctx)` (or your own custom helper) before sensitive work, then rebuild the wasm and republish. See the doc header inside `AuthUtility.cs` for inline guidance.

## Troubleshooting

**"Error with SpacetimeDB: undefined" and a failed WebSocket in the browser console.**  Make sure the connect-dialog **domain** is the same origin the page is served from (the **docker** preset = `ws://localhost:8080`). The bundled Caddyfile reverse-proxies `/v1/*` from port 80 to the embedded SpacetimeDB; selecting the **local** preset (`ws://127.0.0.1:3000`) only works if you also published port 3000, which is not recommended.

**Mode 2 sign-in errors out with `invalid_redirect_uri` or similar before you ever see the provider login.**  The redirect URI Pogly sends isn't registered at the provider. Register `<your-pogly-origin>/callback` *exactly* — no trailing slash, exact scheme and port — and add the silent-renew URI too.

**Container logs say `Runtime config: OIDC enabled` but the login page still acts like Mode 1.**  Hard-refresh (Ctrl+Shift+R) — `/config.js` may still be cached from a previous Mode 1 run. Confirm the current config by visiting `http://<host>:8080/config.js` directly; it should contain your OIDC values.

**`spacetime publish` fails on container start with an ownership error.**  You're trying to republish onto an existing `/stdb` volume with a fresh anonymous identity. Either accept that wasm updates require wiping `/stdb`, or delete the sentinel and roll a fresh volume.

**Cloned the repo on Windows and `docker build` fails with `entrypoint.sh: line 1: syntax error near unexpected token '$'{\\r''`.**  Git checked out shell scripts with CRLF line endings. Run `git add --renormalize . && git checkout -- docker/` to convert them to LF, then retry. The `.gitattributes` rule forces this on fresh clones; the renormalize is only needed for clones predating that rule.

**`docker run` fails with `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.`**  Docker Desktop isn't running. Launch it from the Start menu, wait for the whale icon in the system tray to stop animating, retry.

**Docker Desktop refuses to start: "requires virtualization support."**  Reboot into BIOS/UEFI, enable Intel VT-x / AMD-V / SVM Mode (vendor-dependent location). Confirm afterward with PowerShell:

```powershell
Get-ComputerInfo -Property HyperVRequirementVirtualizationFirmwareEnabled
```

Should print `True`.
