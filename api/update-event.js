import { send, requireAdmin, readJsonFile, writeJsonFile } from "./_github.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed" });

  try {
    requireAdmin(req);

    const body = req.body || {};
    const slug = cleanSlug(body.event_slug);
    if (!slug) return send(res, 400, { ok: false, error: "Missing event_slug" });

    const path = `events/${slug}/event.json`;
    const file = await readJsonFile(path);
    if (!file.exists) return send(res, 404, { ok: false, error: "Event not found" });

    const data = file.json;
    data.live = data.live || {};

    if (typeof body.live_banner === "string") data.live.banner = body.live_banner;
    if (typeof body.live_now === "string") data.live.now = body.live_now;
    if (typeof body.live_next === "string") data.live.next = body.live_next;

    await writeJsonFile(path, data, `Update live event details for ${slug}`);

    return send(res, 200, { ok: true, event: data });
  } catch (err) {
    return send(res, err.statusCode || 500, { ok: false, error: String(err.message || err) });
  }
}

function cleanSlug(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
}
