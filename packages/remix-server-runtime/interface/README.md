# Remix Server Runtime Interface

To be a Remix Server Runtime, a package must export:
- `createCookie`
- `isCookie`
- `createSession`
- `isSession`
- `createSessionStorage`
- `createCookieSessionStorage`
- `createMemorySessionStorage`
- `json`
- `redirect`

Corresponding types for each of these exports are defined in this directory.

Additionally, each Remix Server Runtime must re-export the type definitions in `./types.ts`.