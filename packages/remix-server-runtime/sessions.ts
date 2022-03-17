import { createCookie, isCookie } from "./cookies";
import type { Cookie } from "./interface/cookies";
import type { CreateSession, CreateSessionStorage, IsSession, Session } from "./interface/sessions";
import { warnOnce } from "./warnings";

function flash(name: string): string {
  return `__flash_${name}__`;
}

/**
 * Creates a new Session object.
 *
 * Note: This function is typically not invoked directly by application code.
 * Instead, use a `SessionStorage` object's `getSession` method.
 *
 * @see https://remix.run/api/remix#createsession
 */
export const createSession: CreateSession = (initialData = {}, id = "") => {
  let map = new Map<string, any>(Object.entries(initialData));

  return {
    get id() {
      return id;
    },
    get data() {
      return Object.fromEntries(map);
    },
    has(name) {
      return map.has(name) || map.has(flash(name));
    },
    get(name) {
      if (map.has(name)) return map.get(name);

      let flashName = flash(name);
      if (map.has(flashName)) {
        let value = map.get(flashName);
        map.delete(flashName);
        return value;
      }

      return undefined;
    },
    set(name, value) {
      map.set(name, value);
    },
    flash(name, value) {
      map.set(flash(name), value);
    },
    unset(name) {
      map.delete(name);
    },
  };
}

/**
 * Returns true if an object is a Remix session.
 *
 * @see https://remix.run/api/remix#issession
 */
export const isSession: IsSession = (object): object is Session => {
  return (
    object != null &&
    typeof object.id === "string" &&
    typeof object.data !== "undefined" &&
    typeof object.has === "function" &&
    typeof object.get === "function" &&
    typeof object.set === "function" &&
    typeof object.flash === "function" &&
    typeof object.unset === "function"
  );
}

/**
 * Creates a SessionStorage object using a SessionIdStorageStrategy.
 *
 * Note: This is a low-level API that should only be used if none of the
 * existing session storage options meet your requirements.
 *
 * @see https://remix.run/api/remix#createsessionstorage
 */
export const createSessionStorage: CreateSessionStorage = ({
  cookie: cookieArg,
  createData,
  readData,
  updateData,
  deleteData,
}) => {
  let cookie = isCookie(cookieArg)
    ? cookieArg
    : createCookie(cookieArg?.name || "__session", cookieArg);

  warnOnceAboutSigningSessionCookie(cookie);

  return {
    async getSession(cookieHeader, options) {
      let id = cookieHeader && (await cookie.parse(cookieHeader, options));
      let data = id && (await readData(id));
      return createSession(data || {}, id || "");
    },
    async commitSession(session, options) {
      let { id, data } = session;

      if (id) {
        await updateData(id, data, cookie.expires);
      } else {
        id = await createData(data, cookie.expires);
      }

      return cookie.serialize(id, options);
    },
    async destroySession(session, options) {
      await deleteData(session.id);
      return cookie.serialize("", {
        ...options,
        expires: new Date(0),
      });
    },
  };
}

export function warnOnceAboutSigningSessionCookie(cookie: Cookie) {
  warnOnce(
    cookie.isSigned,
    `The "${cookie.name}" cookie is not signed, but session cookies should be ` +
      `signed to prevent tampering on the client before they are sent back to the ` +
      `server. See https://remix.run/api/remix#signing-cookies ` +
      `for more information.`
  );
}
