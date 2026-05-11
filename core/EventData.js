export class EventData {
  static getSlug(defaultSlug = "ladies-night") {
    const params = new URLSearchParams(window.location.search);
    return params.get("event") || defaultSlug;
  }

  static async load(slug) {
    const res = await fetch(`./events/${slug}/event.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not load event JSON for "${slug}"`);
    return await res.json();
  }
}
