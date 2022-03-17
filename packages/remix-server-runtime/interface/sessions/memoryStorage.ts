import type { SessionIdStorageStrategy, SessionStorage } from "../sessions";

export interface MemorySessionStorageOptions {
  /**
   * The Cookie used to store the session id on the client, or options used
   * to automatically create one.
   */
  cookie?: SessionIdStorageStrategy["cookie"];
}

export type CreateMemorySessionStorage = (options?: MemorySessionStorageOptions) => SessionStorage