import { send, writeJsonFile, readJsonFile } from "./_github.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed" });

  try {
    const body = req.body || {};
    const slug = cleanSlug(body.event_slug);

    if (!slug) return send(res, 400, { ok: false, error: "Missing event_slug" });

    const path = `events/${slug}/rsvps/rsvps.json`;
    const file = await readJsonFile(path);

    const data = file.exists ? file.json : { event_slug: slug, responses: [] };

    data.responses.push({
      created_at: new Date().toISOString(),
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      attending: body.attending || "",
      note: body.note || ""
    });

    await writeJsonFile(path, data, `Add RSVP for ${slug}`);

    return send(res, 200, { ok: true, message: "RSVP saved" });
  } catch (err) {
    return send(res, err.statusCode || 500, { ok: false, error: String(err.message || err) });
  }
}

function cleanSlug(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
}
