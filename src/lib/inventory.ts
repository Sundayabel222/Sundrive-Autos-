/**
 * URL helpers for the inventory listing.
 *
 * Kept free of server-only imports so the filter sidebar, the pagination links
 * and the page itself all build hrefs exactly the same way — one place to get
 * the query string right.
 */

/** Params that are dropped when they carry their default value. */
const DEFAULTS: Record<string, string> = {
  page: "1",
  sort: "newest",
};

/** Build a `/inventory` href, omitting empty and default-valued params. */
export function inventoryHref(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const text = String(value).trim();
    if (!text || DEFAULTS[key] === text) continue;
    search.set(key, text);
  }

  const query = search.toString();
  return query ? `/inventory?${query}` : "/inventory";
}
