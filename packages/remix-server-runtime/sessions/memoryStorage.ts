import type { SessionData } from "../interface/sessions";
import type { CreateMemorySessionStorage } from "../interface/sessions/memoryStorage";
import { createSessionStorage } from "../sessions";

/**
 * Creates and returns a simple in-memory SessionStorage object, mostly useful
 * for testing and as a reference implementation.
 *
 * Note: This storage does not scale beyond a single process, so it is not
 * suitable for most production scenarios.
 *
 * @see https://remix.run/api/remix#creatememorysessionstorage
 */
export const createMemorySessionStorage: CreateMemorySessionStorage = ({
  cookie,
} = {}) => {
  let uniqueId = 0;
  let map = new Map<string, { data: SessionData; expires?: Date }>();

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      let id = (++uniqueId).toString();
      map.set(id, { data, expires });
      return id;
    },
    async readData(id) {
      if (map.has(id)) {
        let { data, expires } = map.get(id)!;

        if (!expires || expires > new Date()) {
          return data;
        }

        // Remove expired session data.
        if (expires) map.delete(id);
      }

      return null;
    },
    async updateData(id, data, expires) {
      map.set(id, { data, expires });
    },
    async deleteData(id) {
      map.delete(id);
    },
  });
}
