import type { CookieParseOptions, CookieSerializeOptions } from "cookie";
import { parse, serialize } from "cookie";

// TODO: Once node v16 is available on AWS we should use these instead of the
// global `sign` and `unsign` functions.
//import { sign, unsign } from "./cookieSigning";
import "./cookieSigning";
import type { Cookie, CreateCookie, IsCookie } from "./interface/cookies";

export type { CookieParseOptions, CookieSerializeOptions };

/**
 * Creates a logical container for managing a browser cookie from the server.
 *
 * @see https://remix.run/api/remix#createcookie
 */
export const createCookie: CreateCookie = (
  name,
  cookieOptions = {}
) => {
  let { secrets, ...options } = {
    secrets: [],
    path: "/",
    ...cookieOptions,
  };

  return {
    get name() {
      return name;
    },
    get isSigned() {
      return secrets.length > 0;
    },
    get expires() {
      // Max-Age takes precedence over Expires
      return typeof options.maxAge !== "undefined"
        ? new Date(Date.now() + options.maxAge * 1000)
        : options.expires;
    },
    async parse(cookieHeader, parseOptions) {
      if (!cookieHeader) return null;
      let cookies = parse(cookieHeader, { ...options, ...parseOptions });
      return name in cookies
        ? cookies[name] === ""
          ? ""
          : await decodeCookieValue(cookies[name], secrets)
        : null;
    },
    async serialize(value, serializeOptions) {
      return serialize(
        name,
        value === "" ? "" : await encodeCookieValue(value, secrets),
        {
          ...options,
          ...serializeOptions,
        }
      );
    },
  };
}

/**
 * Returns true if an object is a Remix cookie container.
 *
 * @see https://remix.run/api/remix#iscookie
 */
export const isCookie: IsCookie = (object): object is Cookie => {
  return (
    object != null &&
    typeof object.name === "string" &&
    typeof object.isSigned === "boolean" &&
    typeof object.parse === "function" &&
    typeof object.serialize === "function"
  );
}

async function encodeCookieValue(
  value: any,
  secrets: string[]
): Promise<string> {
  let encoded = encodeData(value);

  if (secrets.length > 0) {
    encoded = await sign(encoded, secrets[0]);
  }

  return encoded;
}

async function decodeCookieValue(
  value: string,
  secrets: string[]
): Promise<any> {
  if (secrets.length > 0) {
    for (let secret of secrets) {
      let unsignedValue = await unsign(value, secret);
      if (unsignedValue !== false) {
        return decodeData(unsignedValue);
      }
    }

    return null;
  }

  return decodeData(value);
}

function encodeData(value: any): string {
  return btoa(JSON.stringify(value));
}

function decodeData(value: string): any {
  try {
    return JSON.parse(atob(value));
  } catch (error) {
    return {};
  }
}
