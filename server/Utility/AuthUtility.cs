using System.Text.Json;
using SpacetimeDB;

// =============================================================================
// AuthUtility - JWT claim helpers (optional, not wired into any reducer)
// =============================================================================
//
// SpacetimeDB already validates the JWT on the connection: it fetches the
// issuer's JWKS, verifies the signature/expiry/issuer, and derives `ctx.Sender`
// (the Identity) from the token. None of that needs to happen here.
//
// What this file exists for is *reading additional claims off the JWT inside a
// reducer* - e.g. enforcing that only a particular OIDC `sub` may call a
// reducer, branching on `preferred_username`, recording which identity provider
// a user came from, etc.
//
// As shipped, nothing in the module calls these helpers. They are kept as a
// starting point for self-hosters who want claim-driven authorization. To use
// them:
//
//   1. Configure your OIDC issuer/audience to match what you expect, and set
//      OIDC_ISSUER / OIDC_CLIENT_ID in your .env so the React client signs in
//      against that issuer. SpacetimeDB will reject any token whose `iss` is
//      not in its trusted issuer list.
//
//   2. Edit the `expectedIssuer` and `expectedClientIds` arrays below to match
//      your provider. `VerifyClient` throws if the JWT's iss/aud don't match,
//      so callers can rely on the check before reading further claims.
//
//   3. Call `GetJwtUsernameLower(ctx)` / `GetJwtPayloadProperty(claims, "...")`
//      etc. from inside any reducer that needs a claim value.
//
// If you are running purely in Mode 1 (no third-party OIDC, SpacetimeDB issues
// its own anonymous tokens), `ctx.SenderAuth.Jwt` is null and these helpers
// will throw. That is intentional - only call them on code paths that you know
// require an OIDC-issued token.
// =============================================================================

public partial class Module
{
    private static JwtClaims GetJwtClaims(ReducerContext ctx)
    {
        return ctx.SenderAuth.Jwt ?? throw new Exception("Client connected without JWT!");
    }

    private static string GetJwtPayloadProperty(JwtClaims claims, string propertyName)
    {
        using var doc = JsonDocument.Parse(claims.RawPayload);
        if (!doc.RootElement.TryGetProperty(propertyName, out var property))
            throw new Exception($"JWT does not have property: {propertyName}!");

        return property.ToString();
    }

    private static StreamingPlatform GetJwtStreamingPlatform(ReducerContext ctx)
    {
        var claims = GetJwtClaims(ctx);
        VerifyClient(ctx);

        var streamingPlatform = GetJwtPayloadProperty(claims, "login_method");

        return streamingPlatform.ToLower() switch
        {
            "twitch" => StreamingPlatform.Twitch,
            "google" => StreamingPlatform.Youtube,
            "kick" => StreamingPlatform.Kick,
            _ => StreamingPlatform.Unhandled
        };
    }

    private static string GetJwtUsernameLower(ReducerContext ctx)
    {
        var claims = GetJwtClaims(ctx);
        VerifyClient(ctx);

        return GetJwtPayloadProperty(claims, "preferred_username").ToLower();
    }

    private static string GetJwtUsernameCased(ReducerContext ctx)
    {
        var claims = GetJwtClaims(ctx);
        VerifyClient(ctx);

        return GetJwtPayloadProperty(claims, "preferred_username");
    }

    // Self-hosters: replace these with your own issuer URL and client_id(s).
    // The values below are placeholders that will reject every token; uncomment
    // and edit when you actually want to gate reducers behind these checks.
    private static void VerifyClient(ReducerContext ctx)
    {
        if (ctx.SenderAuth.IsInternal) return;

        // const string expectedIssuer = "https://your-oidc-provider.example/";
        // string[] expectedClientIds = { "your-client-id" };
        //
        // var claims = GetJwtClaims(ctx);
        // if (claims.Issuer != expectedIssuer)
        //     throw new Exception("Unauthorized: invalid issuer!");
        // if (!expectedClientIds.Any(i => claims.Audience.Contains(i)))
        //     throw new Exception("Unauthorized: invalid audience!");

        throw new Exception(
            "VerifyClient is not configured. Edit server/Utility/AuthUtility.cs " +
            "and set expectedIssuer/expectedClientIds for your OIDC provider, or " +
            "remove the VerifyClient call from your reducer.");
    }

    // Self-hosters: replace with the OIDC `sub` values you want to treat as
    // privileged "developer" identities, or rewrite to read the list from a
    // module table you control.
    private static void VerifyDeveloper(ReducerContext ctx)
    {
        if (ctx.SenderAuth.IsInternal) return;

        // string[] developerUserIds = { "sub-value-for-your-account" };
        //
        // var claims = GetJwtClaims(ctx);
        // if (!developerUserIds.Any(i => claims.Subject.Contains(i)))
        //     throw new Exception("Unauthorized: invalid developer id!");

        throw new Exception(
            "VerifyDeveloper is not configured. Edit server/Utility/AuthUtility.cs " +
            "and set developerUserIds for your deployment, or remove the " +
            "VerifyDeveloper call from your reducer.");
    }

    private static void VerifyInternal(ReducerContext ctx)
    {
        if (!ctx.SenderAuth.IsInternal)
        {
            throw new Exception("Unauthorized: token is not internal!");
        }
    }
}
