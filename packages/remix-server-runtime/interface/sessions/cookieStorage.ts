import type { SessionIdStorageStrategy, SessionStorage } from "../sessions";

export interface CookieSessionStorageOptions {
  /**
   * The Cookie used to store the session data on the client, or options used
   * to automatically create one.
   */
  cookie?: SessionIdStorageStrategy["cookie"];
}

export type CreateCookieSessionStorage = (options?: CookieSessionStorageOptions) => SessionStorage